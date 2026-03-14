"""Seed database with sample categories, locations, users, and listings."""

import io
import random
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from PIL import Image, ImageDraw, ImageFont

from apps.accounts.models import User
from apps.listings.models import Category, Listing, ListingImage, Location


CATEGORIES = {
    "Real Estate": {
        "icon": "🏠",
        "children": {
            "For Sale": {"icon": "", "children": {"Apartment": {"icon": ""}, "House": {"icon": ""}, "Land": {"icon": ""}}},
            "For Rent": {"icon": "", "children": {"Apartment": {"icon": ""}, "Room": {"icon": ""}, "Office Space": {"icon": ""}}},
            "Commercial Property": {"icon": "", "children": {}},
        },
    },
    "Mobile Phones & Accessories": {
        "icon": "📱",
        "children": {
            "Smartphones": {"icon": "📲", "children": {"Samsung": {"icon": ""}, "iPhone": {"icon": ""}, "Xiaomi": {"icon": ""}, "OnePlus": {"icon": ""}}},
            "Feature Phones": {"icon": "📞", "children": {}},
            "Phone Accessories": {"icon": "🔌", "children": {"Cases & Covers": {"icon": ""}, "Chargers & Cables": {"icon": ""}, "Screen Protectors": {"icon": ""}}},
            "Tablets": {"icon": "📟", "children": {}},
        },
    },
    "Automobiles": {
        "icon": "🚗",
        "children": {
            "Cars": {"icon": "🚗", "children": {"Sedan": {"icon": ""}, "SUV": {"icon": ""}, "Hatchback": {"icon": ""}, "Jeep": {"icon": ""}}},
            "Motorcycles": {"icon": "🏍️", "children": {"Scooters": {"icon": ""}, "Sport Bikes": {"icon": ""}, "Standard Bikes": {"icon": ""}}},
            "Bicycles": {"icon": "🚲", "children": {}},
            "Auto Parts & Accessories": {"icon": "🔧", "children": {}},
            "Heavy Vehicles": {"icon": "🚛", "children": {}},
        },
    },
    "Computers & Peripherals": {
        "icon": "💻",
        "children": {
            "Laptops": {"icon": "💻", "children": {}},
            "Desktops": {"icon": "🖥️", "children": {}},
            "Monitors": {"icon": "🖥️", "children": {}},
            "Printers & Scanners": {"icon": "🖨️", "children": {}},
            "Networking Equipment": {"icon": "📡", "children": {}},
            "Computer Accessories": {"icon": "⌨️", "children": {"Keyboards": {"icon": ""}, "Mouse": {"icon": ""}, "Webcams": {"icon": ""}, "Storage Drives": {"icon": ""}}},
        },
    },
    "Electronics, TVs & More": {
        "icon": "📺",
        "children": {
            "Televisions": {"icon": "📺", "children": {}},
            "Cameras & Photography": {"icon": "📷", "children": {}},
            "Audio & Headphones": {"icon": "🎧", "children": {}},
            "Gaming Consoles": {"icon": "🎮", "children": {}},
            "Home Appliances": {"icon": "🏠", "children": {"Kitchen Appliances": {"icon": ""}, "Washing Machines": {"icon": ""}, "Air Conditioners": {"icon": ""}, "Refrigerators": {"icon": ""}}},
            "Drones & Gadgets": {"icon": "🤖", "children": {}},
        },
    },
    "Furnishings & Appliances": {
        "icon": "🛋️",
        "children": {
            "Furniture": {"icon": "🪑", "children": {"Sofa & Chairs": {"icon": ""}, "Beds & Mattresses": {"icon": ""}, "Tables & Desks": {"icon": ""}, "Wardrobes": {"icon": ""}}},
            "Home Decor": {"icon": "🖼️", "children": {}},
            "Garden & Outdoor": {"icon": "🌿", "children": {}},
            "Lighting & Fans": {"icon": "💡", "children": {}},
        },
    },
    "Apparels & Accessories": {
        "icon": "👕",
        "children": {
            "Men's Clothing": {"icon": "👔", "children": {}},
            "Women's Clothing": {"icon": "👗", "children": {}},
            "Kids' Clothing": {"icon": "👶", "children": {}},
            "Shoes & Footwear": {"icon": "👟", "children": {}},
            "Watches & Jewelry": {"icon": "⌚", "children": {}},
            "Bags & Luggage": {"icon": "👜", "children": {}},
        },
    },
    "Business & Industrial": {
        "icon": "🏭",
        "children": {
            "Office Equipment": {"icon": "🖨️", "children": {}},
            "Industrial Machinery": {"icon": "⚙️", "children": {}},
            "Raw Materials": {"icon": "🧱", "children": {}},
            "Business for Sale": {"icon": "🏪", "children": {}},
            "Trade & Export": {"icon": "📦", "children": {}},
        },
    },
    "Jobs": {
        "icon": "💼",
        "children": {
            "Full-Time": {"icon": "🕐", "children": {}},
            "Part-Time": {"icon": "⏰", "children": {}},
            "Freelance": {"icon": "💻", "children": {}},
            "Internship": {"icon": "🎓", "children": {}},
            "Work from Home": {"icon": "🏠", "children": {}},
        },
    },
    "Services": {
        "icon": "🔨",
        "children": {
            "Education & Tuition": {"icon": "📚", "children": {}},
            "Repair & Maintenance": {"icon": "🔧", "children": {}},
            "Event Planning": {"icon": "🎉", "children": {}},
            "Cleaning & Pest Control": {"icon": "🧹", "children": {}},
            "Transportation & Moving": {"icon": "🚚", "children": {}},
            "IT & Web Services": {"icon": "🌐", "children": {}},
        },
    },
    "Sports & Fitness": {
        "icon": "⚽",
        "children": {
            "Gym & Fitness Equipment": {"icon": "🏋️", "children": {}},
            "Sports Equipment": {"icon": "🏏", "children": {}},
            "Cycling": {"icon": "🚴", "children": {}},
            "Outdoor & Adventure": {"icon": "⛰️", "children": {}},
            "Musical Instruments": {"icon": "🎸", "children": {}},
            "Books & Magazines": {"icon": "📖", "children": {}},
        },
    },
    "Beauty & Health": {
        "icon": "💆",
        "children": {
            "Skin Care": {"icon": "🧴", "children": {}},
            "Hair Care": {"icon": "💇", "children": {}},
            "Makeup & Cosmetics": {"icon": "💄", "children": {}},
            "Health Supplements": {"icon": "💊", "children": {}},
            "Personal Care": {"icon": "🪥", "children": {}},
            "Medical Equipment": {"icon": "🩺", "children": {}},
        },
    },
}


LOCATIONS = {
    "Bagmati Province": {
        "districts": {
            "Kathmandu": ["Kathmandu", "Kirtipur", "Budhanilkantha"],
            "Lalitpur": ["Patan", "Godawari"],
            "Bhaktapur": ["Bhaktapur", "Suryabinayak"],
        }
    },
    "Gandaki Province": {
        "districts": {
            "Kaski": ["Pokhara", "Lekhnath"],
            "Tanahun": ["Damauli"],
        }
    },
    "Lumbini Province": {
        "districts": {
            "Rupandehi": ["Butwal", "Siddharthanagar"],
            "Kapilvastu": ["Taulihawa"],
        }
    },
    "Koshi Province": {
        "districts": {
            "Morang": ["Biratnagar", "Sundar Haraicha"],
            "Sunsari": ["Itahari", "Dharan"],
        }
    },
    "Madhesh Province": {
        "districts": {
            "Bara": ["Kalaiya", "Simara"],
            "Parsa": ["Birgunj"],
        }
    },
}


COLOR_MAP = {
    "Real Estate": (142, 68, 173),
    "Mobile Phones & Accessories": (41, 128, 185),
    "Automobiles": (39, 174, 96),
    "Computers & Peripherals": (52, 73, 94),
    "Electronics, TVs & More": (44, 62, 80),
    "Furnishings & Appliances": (243, 156, 18),
    "Apparels & Accessories": (231, 76, 60),
    "Business & Industrial": (127, 140, 141),
    "Jobs": (155, 89, 182),
    "Services": (22, 160, 133),
    "Sports & Fitness": (211, 84, 0),
    "Beauty & Health": (232, 67, 147),
}


SAMPLE_LISTINGS = [
    {
        "title": "Samsung Galaxy S26 Ultra 512GB Orange",
        "description": "Brand new Samsung Galaxy S26 Ultra with 512GB storage. Comes with original box, charger, and 1 year warranty. Snapdragon 8 Elite processor, 200MP camera, titanium frame. Purchased from Jai Electronics, New Road. Price is slightly negotiable.",
        "category_path": ["Mobile Phones & Accessories", "Smartphones", "Samsung"],
        "price": 185000,
        "condition": "new",
        "price_type": "negotiable",
        "color": (41, 128, 185),
        "img_label": "Galaxy S26 Ultra",
    },
    {
        "title": "iPhone 16 Pro Max 256GB Natural Titanium",
        "description": "Selling my iPhone 16 Pro Max, used for only 3 months. 256GB Natural Titanium color. Battery health at 98%. Comes with original box and accessories. No scratches, always used with case and screen protector. Reason for selling: switching to Android.",
        "category_path": ["Mobile Phones & Accessories", "Smartphones", "iPhone"],
        "price": 195000,
        "condition": "like_new",
        "price_type": "fixed",
        "color": (100, 100, 100),
        "img_label": "iPhone 16 Pro Max",
    },
    {
        "title": "Dell XPS 15 Laptop i7 32GB RAM",
        "description": "Dell XPS 15 with Intel Core i7-14700H, 32GB RAM, 1TB SSD, NVIDIA RTX 4050. 15.6 inch OLED display with 3.5K resolution. Excellent for programming, video editing, and design work. Includes original charger and laptop bag. Bill available.",
        "category_path": ["Computers & Peripherals", "Laptops"],
        "price": 210000,
        "condition": "like_new",
        "price_type": "negotiable",
        "color": (52, 73, 94),
        "img_label": "Dell XPS 15",
    },
    {
        "title": "Honda Dio 125 Scooter 2024 Model",
        "description": "Honda Dio 125 scooter, 2024 model with only 5000km driven. Single owner, regularly serviced at Honda authorized center. Excellent mileage of 50km/l. All documents up to date including insurance valid till 2026. Color: Matte Grey. No accidents.",
        "category_path": ["Automobiles", "Motorcycles", "Scooters"],
        "price": 245000,
        "condition": "like_new",
        "price_type": "negotiable",
        "color": (39, 174, 96),
        "img_label": "Honda Dio 125",
    },
    {
        "title": "Yamaha R15 V4 Sports Bike 2023",
        "description": "Yamaha R15 V4 racing blue color, 2023 model. Well maintained with full service history. New tires, chain sprocket recently replaced. Perfect condition. Engine, suspension everything in top shape. Selling because upgrading to bigger bike.",
        "category_path": ["Automobiles", "Motorcycles", "Sport Bikes"],
        "price": 425000,
        "condition": "used",
        "price_type": "negotiable",
        "color": (0, 51, 153),
        "img_label": "Yamaha R15 V4",
    },
    {
        "title": "2BHK Apartment for Rent in Jhamsikhel",
        "description": "Spacious 2BHK apartment available for rent in Jhamsikhel, Lalitpur. Features: 2 bedrooms, 1 living room, 1 kitchen, 2 bathrooms. Fully furnished with AC, geyser, and modular kitchen. Parking available for 1 car and 1 bike. Near cafes, restaurants and embassies.",
        "category_path": ["Real Estate", "For Rent", "Apartment"],
        "price": 40000,
        "condition": "new",
        "price_type": "fixed",
        "color": (142, 68, 173),
        "img_label": "2BHK Jhamsikhel",
    },
    {
        "title": "8 Aana Land for Sale in Budhanilkantha",
        "description": "8 Aana land available for sale in Budhanilkantha, facing south. 13 feet road access. Peaceful residential area with mountain view. Near schools, hospitals and market. All documents clear. Suitable for residential building construction. Urgent sale.",
        "category_path": ["Real Estate", "For Sale", "Land"],
        "price": 3200000,
        "condition": "new",
        "price_type": "negotiable",
        "color": (120, 80, 40),
        "img_label": "Land Budhanilkantha",
    },
    {
        "title": "Nike Air Max 90 Original Size 42",
        "description": "Authentic Nike Air Max 90 sneakers, size 42 (US 8.5). Bought from Nike store in Dubai. Worn only twice, in excellent condition. Classic white/red colorway. Original box included. Selling because wrong size ordered.",
        "category_path": ["Apparels & Accessories", "Shoes & Footwear"],
        "price": 14000,
        "condition": "like_new",
        "price_type": "fixed",
        "color": (231, 76, 60),
        "img_label": "Nike Air Max 90",
    },
    {
        "title": "L-Shaped Sofa Set with Ottoman",
        "description": "Premium quality L-shaped sofa set with ottoman, dark grey fabric upholstery. Purchased from Durbar Marg furniture store 6 months ago for Rs 85,000. Seats 6 people comfortably. Very clean, no stains or tears. Selling due to relocation abroad.",
        "category_path": ["Furnishings & Appliances", "Furniture", "Sofa & Chairs"],
        "price": 55000,
        "condition": "like_new",
        "price_type": "negotiable",
        "color": (243, 156, 18),
        "img_label": "L-Shaped Sofa",
    },
    {
        "title": "Samsung 65 inch 4K Smart TV QLED",
        "description": "Samsung 65 inch QLED 4K Smart TV (2025 model). Quantum HDR, Tizen OS with Netflix, YouTube built-in. Wall mount included. Remote and box available. Picture quality is stunning. Reason for selling: upgrading to OLED.",
        "category_path": ["Electronics, TVs & More", "Televisions"],
        "price": 95000,
        "condition": "used",
        "price_type": "negotiable",
        "color": (44, 62, 80),
        "img_label": "Samsung 65\" QLED TV",
    },
    {
        "title": "Yamaha FG800 Acoustic Guitar",
        "description": "Yamaha FG800 acoustic guitar in excellent condition. Solid spruce top with scalloped bracing for rich, warm tone. Includes padded gig bag, capo, extra strings, and guitar stand. Great for beginners and intermediate players. Barely played.",
        "category_path": ["Sports & Fitness", "Musical Instruments"],
        "price": 20000,
        "condition": "like_new",
        "price_type": "fixed",
        "color": (160, 100, 40),
        "img_label": "Yamaha FG800 Guitar",
    },
    {
        "title": "Math & Science Tuition Classes Grade 9-12",
        "description": "Experienced teacher offering math and science tuition for grades 9-12. NEB and SEE preparation. 5+ years of teaching experience with excellent results. Individual attention in small batches of 5-8 students. Morning and evening batches available. Location: Baneshwor.",
        "category_path": ["Services", "Education & Tuition"],
        "price": 4000,
        "condition": "new",
        "price_type": "fixed",
        "color": (22, 160, 133),
        "img_label": "Tuition Classes",
    },
    {
        "title": "Treadmill - Powermax TDA-230 Motorized",
        "description": "Powermax TDA-230 motorized treadmill with auto incline. 2.0 HP motor, speed up to 14 km/h, 15 level auto incline. LCD display showing speed, time, distance, calories. Foldable design saves space. Used for 8 months. Excellent working condition.",
        "category_path": ["Sports & Fitness", "Gym & Fitness Equipment"],
        "price": 48000,
        "condition": "used",
        "price_type": "negotiable",
        "color": (211, 84, 0),
        "img_label": "Powermax Treadmill",
    },
    {
        "title": "Toyota Aqua Hybrid 2019 Model",
        "description": "Toyota Aqua Hybrid 2019 model, excellent fuel efficiency (30+ km/l). Lot 3, single owner. Total 45,000 km driven. All original, no repainting. AC, power steering, power windows, ABS, airbags all working perfectly. Insurance and road tax up to date.",
        "category_path": ["Automobiles", "Cars", "Hatchback"],
        "price": 3550000,
        "condition": "used",
        "price_type": "negotiable",
        "color": (46, 134, 193),
        "img_label": "Toyota Aqua 2019",
    },
    {
        "title": "Apple Watch Series 10 GPS 46mm",
        "description": "Apple Watch Series 10 GPS, 46mm Midnight Aluminum Case with Midnight Sport Band. Used for 2 months. Battery health 100%. Always on display, blood oxygen sensor, ECG app. Includes original box, charger, and extra sport band (Starlight).",
        "category_path": ["Apparels & Accessories", "Watches & Jewelry"],
        "price": 58000,
        "condition": "like_new",
        "price_type": "negotiable",
        "color": (50, 50, 50),
        "img_label": "Apple Watch S10",
    },
    {
        "title": "Room for Rent in Thamel for Students",
        "description": "Single furnished room available for rent near Thamel. Suitable for students or working professionals. Includes bed, table, chair, and cupboard. Shared kitchen and bathroom. WiFi included. Water 24/7. Peaceful environment near main road. No couples.",
        "category_path": ["Real Estate", "For Rent", "Room"],
        "price": 9000,
        "condition": "new",
        "price_type": "fixed",
        "color": (155, 89, 182),
        "img_label": "Room Thamel",
    },
    {
        "title": "CNC Machine Industrial Grade - Used",
        "description": "Industrial grade CNC milling machine. 3-axis, working area 600x400x300mm. Spindle speed up to 8000 RPM. Well maintained, used in furniture workshop. Selling due to business closure. Includes tooling kit and documentation.",
        "category_path": ["Business & Industrial", "Industrial Machinery"],
        "price": 450000,
        "condition": "used",
        "price_type": "negotiable",
        "color": (127, 140, 141),
        "img_label": "CNC Machine",
    },
    {
        "title": "Korean Skin Care Set - The Ordinary",
        "description": "Complete The Ordinary skincare set. Includes Niacinamide 10% + Zinc 1%, Hyaluronic Acid 2% + B5, AHA 30% + BHA 2% Peeling Solution, and Natural Moisturizing Factors. All brand new, sealed. Brought from Korea. Great for all skin types.",
        "category_path": ["Beauty & Health", "Skin Care"],
        "price": 5500,
        "condition": "new",
        "price_type": "fixed",
        "color": (232, 67, 147),
        "img_label": "The Ordinary Set",
    },
    {
        "title": "Full-Stack Developer - Remote Job",
        "description": "Hiring Full-Stack Developer (React + Node.js). Remote position with flexible hours. Must have 2+ years experience. Good salary based on experience. Benefits include health insurance and festival bonus. Apply with your portfolio and CV.",
        "category_path": ["Jobs", "Full-Time"],
        "price": 80000,
        "condition": "new",
        "price_type": "fixed",
        "color": (155, 89, 182),
        "img_label": "Dev Job Opening",
    },
    {
        "title": "Canon EOS R6 Mark II Mirrorless Camera",
        "description": "Canon EOS R6 Mark II with RF 24-105mm f/4L IS USM lens. 24.2 MP full-frame CMOS sensor. 40fps continuous shooting. 4K 60fps video. Dual card slots. Extra battery and 128GB CFexpress card included. Shutter count under 5000. Mint condition.",
        "category_path": ["Electronics, TVs & More", "Cameras & Photography"],
        "price": 320000,
        "condition": "like_new",
        "price_type": "negotiable",
        "color": (30, 30, 30),
        "img_label": "Canon EOS R6 II",
    },
]


def generate_placeholder_image(width, height, color, label):
    """Generate a placeholder product image with Pillow."""
    img = Image.new("RGB", (width, height), color=color)
    draw = ImageDraw.Draw(img)

    # Add a gradient overlay
    for y in range(height):
        alpha = int(80 * (y / height))
        draw.line([(0, y), (width, y)], fill=(alpha, alpha, alpha))

    # Draw centered label text
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSans-Bold.ttf", 28)
        except (IOError, OSError):
            font = ImageFont.load_default()

    # Center the text
    bbox = draw.textbbox((0, 0), label, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (width - text_w) // 2
    y_pos = (height - text_h) // 2

    # Draw text shadow
    draw.text((x + 2, y_pos + 2), label, fill=(0, 0, 0), font=font)
    # Draw text
    draw.text((x, y_pos), label, fill=(255, 255, 255), font=font)

    # Draw a subtle border
    draw.rectangle([0, 0, width - 1, height - 1], outline=(255, 255, 255, 128), width=2)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    buf.seek(0)
    return buf


class Command(BaseCommand):
    help = "Seed database with sample categories, locations, users, and listings"

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Delete existing seed data before creating new")

    def handle(self, *args, **options):
        if options["flush"]:
            self.stdout.write("Flushing existing data...")
            ListingImage.objects.all().delete()
            Listing.objects.all().delete()
            Category.objects.all().delete()
            Location.objects.all().delete()
            User.objects.filter(email__endswith="@sabthok.test").delete()

        # Create categories
        self.stdout.write("Creating categories...")
        cat_map = {}
        order = 0
        for top_name, top_data in CATEGORIES.items():
            order += 1
            top_cat, _ = Category.objects.get_or_create(
                slug=top_name.lower().replace(" & ", "-").replace(", ", "-").replace(" ", "-"),
                defaults={"name": top_name, "icon": top_data["icon"], "ordering": order},
            )
            # Update icon if category already exists but icon is empty
            if not top_cat.icon and top_data["icon"]:
                top_cat.icon = top_data["icon"]
                top_cat.save(update_fields=["icon"])
            cat_map[top_name] = top_cat

            child_order = 0
            for child_name, child_data in top_data.get("children", {}).items():
                child_order += 1
                child_slug = f"{top_cat.slug}-{child_name.lower().replace(' & ', '-').replace(', ', '-').replace(' ', '-').replace("'", "")}"
                child_cat, _ = Category.objects.get_or_create(
                    slug=child_slug,
                    defaults={"name": child_name, "parent": top_cat, "icon": child_data.get("icon", ""), "ordering": child_order},
                )
                cat_map[child_name] = child_cat

                sub_order = 0
                for sub_name, sub_data in child_data.get("children", {}).items():
                    sub_order += 1
                    sub_slug = f"{child_slug}-{sub_name.lower().replace(' & ', '-').replace(', ', '-').replace(' ', '-').replace("'", "")}"
                    sub_cat, _ = Category.objects.get_or_create(
                        slug=sub_slug,
                        defaults={"name": sub_name, "parent": child_cat, "icon": sub_data.get("icon", ""), "ordering": sub_order},
                    )
                    cat_map[sub_name] = sub_cat

        self.stdout.write(self.style.SUCCESS(f"  Created {len(cat_map)} categories"))

        # Create locations
        self.stdout.write("Creating locations...")
        loc_map = {}
        for province_name, province_data in LOCATIONS.items():
            prov, _ = Location.objects.get_or_create(
                slug=province_name.lower().replace(" ", "-"),
                level="province",
                defaults={"name": province_name},
            )

            for district_name, cities in province_data["districts"].items():
                dist, _ = Location.objects.get_or_create(
                    slug=district_name.lower().replace(" ", "-"),
                    level="district",
                    defaults={"name": district_name, "parent": prov},
                )

                for city_name in cities:
                    city, _ = Location.objects.get_or_create(
                        slug=city_name.lower().replace(" ", "-"),
                        level="city",
                        defaults={"name": city_name, "parent": dist},
                    )
                    loc_map[city_name] = city

        self.stdout.write(self.style.SUCCESS(f"  Created locations across {len(LOCATIONS)} provinces"))

        # Create sample users
        self.stdout.write("Creating sample users...")
        users = []
        user_data = [
            {"phone": "+9779801234567", "email": "ram@sabthok.test", "full_name": "Ram Sharma", "password": "Test1234"},
            {"phone": "+9779812345678", "email": "sita@sabthok.test", "full_name": "Sita Adhikari", "password": "Test1234"},
            {"phone": "+9779823456789", "email": "hari@sabthok.test", "full_name": "Hari Thapa", "password": "Test1234"},
            {"phone": "+9779834567890", "email": "gita@sabthok.test", "full_name": "Gita Gurung", "password": "Test1234"},
        ]
        for ud in user_data:
            user, created = User.objects.get_or_create(
                email=ud["email"],
                defaults={
                    "phone": ud["phone"],
                    "full_name": ud["full_name"],
                    "is_verified": True,
                },
            )
            if created:
                user.set_password(ud["password"])
                user.save()
            users.append(user)

        self.stdout.write(self.style.SUCCESS(f"  Created {len(users)} sample users"))

        # Create listings
        self.stdout.write("Creating sample listings with images...")
        city_names = list(loc_map.keys())
        created_count = 0

        for item in SAMPLE_LISTINGS:
            # Find the deepest category in the path
            cat_path = item["category_path"]
            category = None
            for name in reversed(cat_path):
                if name in cat_map:
                    category = cat_map[name]
                    break

            if not category:
                self.stdout.write(self.style.WARNING(f"  Skipping '{item['title']}': category not found"))
                continue

            location = loc_map[random.choice(city_names)]
            seller = random.choice(users)

            # Check if listing already exists (by title)
            if Listing.objects.filter(title=item["title"]).exists():
                self.stdout.write(f"  Skipping '{item['title']}' (already exists)")
                continue

            listing = Listing.objects.create(
                seller=seller,
                category=category,
                location=location,
                title=item["title"],
                description=item["description"],
                price=Decimal(str(item["price"])),
                price_type=item["price_type"],
                condition=item["condition"],
                status=Listing.Status.ACTIVE,
                published_at=timezone.now(),
                views_count=random.randint(10, 500),
                is_featured=random.random() < 0.2,
            )

            # Generate 2-3 images per listing
            num_images = random.randint(2, 3)
            for i in range(num_images):
                w, h = random.choice([(800, 600), (640, 480), (1024, 768)])
                # Slightly vary the color for each image
                base_color = item["color"]
                varied_color = tuple(
                    max(0, min(255, c + random.randint(-30, 30))) for c in base_color
                )
                suffix = ["- Front", "- Side", "- Detail"][i] if i < 3 else ""
                label = f"{item['img_label']}{suffix}"

                img_buf = generate_placeholder_image(w, h, varied_color, label)
                image_file = ContentFile(img_buf.read(), name=f"{listing.slug}-{i + 1}.jpg")

                ListingImage.objects.create(
                    listing=listing,
                    image=image_file,
                    ordering=i,
                )

            created_count += 1
            self.stdout.write(f"  + {item['title']} ({num_images} images)")

        self.stdout.write(self.style.SUCCESS(f"\nDone! Created {created_count} listings with images."))
        self.stdout.write(self.style.SUCCESS(f"Total categories: {Category.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"Total locations: {Location.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"Total listings: {Listing.objects.count()}"))
