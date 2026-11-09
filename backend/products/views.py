"""JSON API for products: list (filtered), detail, categories, brands."""
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET

from .models import Category, Brand, Product


def _json(data, status=200):
    return JsonResponse(data, status=status, json_dumps_params={"ensure_ascii": False})


def _product_summary(p):
    colors = {}
    for v in p.variants.all():
        colors.setdefault(v.color_name, v.color_hex)
    sizes = sorted({v.size for v in p.variants.all()})
    out_of_stock = sorted({v.size for v in p.variants.all() if v.stock == 0})
    in_stock = any(v.stock > 0 for v in p.variants.all())
    return {
        "id": p.id, "name": p.name, "nameEn": p.name_en,
        "brand": p.brand.name if p.brand else None,
        "sku": p.sku, "category": p.category.slug if p.category else None,
        "price": p.price, "oldPrice": p.old_price,
        "image": p.image.url if p.image else None,
        "hoverImage": p.hover_image.url if p.hover_image else None,
        "rating": p.rating, "reviewCount": p.review_count,
        "colors": [{"name": k, "hex": v} for k, v in colors.items()],
        "sizes": sizes, "outOfStockSizes": out_of_stock,
        "inStock": in_stock, "description": p.description,
        "isNew": p.is_new, "isBestseller": p.is_bestseller,
        "isSpecial": p.is_special,
    }


@require_GET
def product_list(request):
    category = request.GET.get("category")
    brands = request.GET.getlist("brand")
    colors = request.GET.getlist("color")
    sizes = request.GET.getlist("size")
    q = request.GET.get("q", "").strip()
    only_stock = request.GET.get("onlyStock") == "1"
    only_discount = request.GET.get("onlyDiscount") == "1"
    sort = request.GET.get("sort", "newest")
    page = max(1, int(request.GET.get("page", 1)))
    page_size = min(48, max(1, int(request.GET.get("pageSize", 24))))

    qs = Product.objects.filter(is_active=True).prefetch_related("variants", "brand", "category")

    # Category filter (incl. children for top-level).
    if category and category not in ("brands", "sale"):
        cat = Category.objects.filter(slug=category).first()
        if cat:
            ids = [cat.id] + [c.id for c in cat.children.all()]
            qs = qs.filter(category_id__in=ids)
        elif category in ("women", "men", "kids"):
            roots = Category.objects.filter(slug=category)
            ids = [r.id for r in roots] + [c.id for r in roots for c in r.children.all()]
            qs = qs.filter(category_id__in=ids)

    if brands:
        qs = qs.filter(brand__name__in=brands)
    if q:
        qs = qs.filter(
            Q(name__icontains=q) | Q(name_en__icontains=q)
            | Q(sku__icontains=q) | Q(brand__name__icontains=q)
        )
    if only_discount:
        qs = qs.filter(old_price__isnull=False)
    if colors or sizes or only_stock:
        qs = qs.distinct()
        if colors:
            qs = qs.filter(variants__color_name__in=colors)
        if sizes:
            qs = qs.filter(variants__size__in=sizes)
        if only_stock:
            qs = qs.filter(variants__stock__gt=0)

    if category == "sale":
        qs = qs.filter(Q(is_special=True) | Q(old_price__isnull=False))

    sort_map = {
        "cheap": "price", "expensive": "-price",
        "bestseller": "-is_bestseller", "popular": "-review_count",
        "newest": "-created_at",
    }
    qs = qs.order_by(sort_map.get(sort, "-created_at"))

    total = qs.count()
    offset = (page - 1) * page_size
    items = [_product_summary(p) for p in qs[offset : offset + page_size]]

    return _json({
        "items": items, "total": total, "page": page,
        "pageSize": page_size, "totalPages": (total + page_size - 1) // page_size,
    })


@require_GET
def product_detail(request, pk):
    # Accept either id or slug.
    qs = Product.objects.filter(is_active=True).prefetch_related("variants", "brand", "category", "category__parent")
    p = qs.filter(Q(id=pk) | Q(slug=pk)).first()
    if not p:
        return _json({"error": "محصول یافت نشد"}, 404)

    colors = {}
    for v in p.variants.all():
        colors.setdefault(v.color_name, v.color_hex)
    sizes = sorted({v.size for v in p.variants.all()})
    out_of_stock = sorted({v.size for v in p.variants.all() if v.stock == 0})
    stock_matrix = [
        {"colorName": v.color_name, "size": v.size, "stock": v.stock,
         "price": v.effective_price, "variantId": v.id}
        for v in p.variants.all()
    ]

    related = (
        Product.objects.filter(category=p.category, is_active=True)
        .exclude(pk=p.pk)[:8]
    )

    return _json({
        "product": {
            "id": p.id, "name": p.name, "nameEn": p.name_en,
            "brand": p.brand.name if p.brand else None,
            "brandId": p.brand_id,
            "sku": p.sku,
            "category": p.category.slug if p.category else None,
            "categoryTitle": p.category.title if p.category else None,
            "parentCategory": p.category.parent.slug if p.category and p.category.parent else None,
            "price": p.price, "oldPrice": p.old_price,
            "image": p.image.url if p.image else None,
            "hoverImage": p.hover_image.url if p.hover_image else None,
            "rating": p.rating, "reviewCount": p.review_count,
            "description": p.description,
            "colors": [{"name": k, "hex": v} for k, v in colors.items()],
            "sizes": sizes, "outOfStockSizes": out_of_stock,
            "stockMatrix": stock_matrix,
            "isNew": p.is_new, "isBestseller": p.is_bestseller,
            "isSpecial": p.is_special,
        },
        "related": [_product_summary(r) for r in related],
    })


@require_GET
def categories(request):
    roots = Category.objects.filter(parent__isnull=True).order_by("title").prefetch_related("children")
    return _json({
        "categories": [
            {
                "id": c.id, "title": c.title, "slug": c.slug,
                "image": c.image.url if c.image else None,
                "children": [
                    {"id": ch.id, "title": ch.title, "slug": ch.slug,
                     "image": ch.image.url if ch.image else None}
                    for ch in c.children.all().order_by("title")
                ],
            }
            for c in roots
        ]
    })


@require_GET
def brands(request):
    return _json({
        "brands": [
            {"id": b.id, "name": b.name, "nameEn": b.name_en, "logoText": b.logo_text}
            for b in Brand.objects.order_by("name")
        ]
    })
