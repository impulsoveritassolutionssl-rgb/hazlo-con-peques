import { NextResponse } from "next/server";
import { totalumSdk } from "@/lib/totalum";

// Helper function for serializing errors
function serializeError(err: unknown) {
  const e = err as { message?: string; code?: string; name?: string; response?: { status?: number; data?: unknown }; stack?: string };
  return {
    message: e?.message ?? "Unknown error",
    code: e?.code ?? null,
    name: e?.name ?? null,
    status: e?.response?.status ?? null,
    responseData: e?.response?.data ?? null,
  };
}

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

// Generate random ticket code
function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Sample activity data
const sampleActivities = [
  {
    title: "Taller de Ciencia Divertida",
    short_description: "Experimentos increíbles para pequeños científicos",
    description: "Un taller lleno de experimentos asombrosos donde los niños aprenderán los principios básicos de la física y química de forma divertida. Crearemos volcanes, cohetes de agua, y mucho más. Incluye todos los materiales necesarios.",
    category: "ciencia",
    age_min: 6,
    age_max: 12,
    modality: "presencial",
    location_name: "Centro Cultural La Casa de los Peques",
    location_address: "Calle Mayor 45, Madrid",
    city: "Madrid",
    capacity_total: 20,
    price_cents: 1500,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    requirements: "Ropa cómoda que se pueda manchar. Traer una botella de agua.",
    cancellation_policy: "Cancelación gratuita hasta 24 horas antes del evento.",
  },
  {
    title: "Arte y Creatividad para Peques",
    short_description: "Descubre el artista que llevas dentro",
    description: "Taller de pintura, escultura y manualidades donde los niños podrán expresar su creatividad usando diferentes técnicas artísticas. Trabajaremos con acuarelas, plastilina, collage y materiales reciclados.",
    category: "arte",
    age_min: 4,
    age_max: 10,
    modality: "presencial",
    location_name: "Estudio Artístico Pequeños Genios",
    location_address: "Paseo de la Castellana 120, Madrid",
    city: "Madrid",
    capacity_total: 15,
    price_cents: 1200,
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800",
    requirements: "Bata o camiseta vieja. Los materiales están incluidos.",
    cancellation_policy: "Devolución del 50% si cancelas con 48h de antelación.",
  },
  {
    title: "Mini Concierto de Música Clásica",
    short_description: "La magia de la música para los más pequeños",
    description: "Concierto interactivo diseñado especialmente para niños donde conocerán instrumentos de la orquesta, escucharán piezas famosas y podrán participar en actividades musicales. Una experiencia única para iniciarles en el mundo de la música clásica.",
    category: "musica",
    age_min: 3,
    age_max: 8,
    modality: "presencial",
    location_name: "Auditorio Municipal",
    location_address: "Plaza de España 1, Barcelona",
    city: "Barcelona",
    capacity_total: 50,
    price_cents: 800,
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800",
    requirements: "Nada especial, solo ganas de disfrutar la música.",
    cancellation_policy: "No hay devoluciones una vez comprada la entrada.",
  },
  {
    title: "Aventura en la Naturaleza",
    short_description: "Explora el bosque como un verdadero explorador",
    description: "Excursión guiada por el parque natural donde los niños aprenderán sobre flora y fauna local, seguirán pistas de animales y realizarán actividades de orientación. Incluye picnic saludable y material de explorador.",
    category: "naturaleza",
    age_min: 7,
    age_max: 14,
    modality: "presencial",
    location_name: "Parque Natural Sierra de Guadarrama",
    location_address: "Centro de Visitantes, Cercedilla",
    city: "Cercedilla",
    capacity_total: 25,
    price_cents: 2500,
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800",
    requirements: "Calzado cómodo de montaña, ropa de abrigo, protección solar.",
    cancellation_policy: "Cancelación gratuita hasta 72 horas antes. Se cancela si hay mal tiempo.",
  },
  {
    title: "Club de Lectura Infantil",
    short_description: "Viaja a mundos fantásticos a través de los libros",
    description: "Sesión de cuentacuentos y lectura compartida donde los niños descubrirán historias increíbles, participarán en actividades relacionadas con los libros y desarrollarán su amor por la lectura. Cada sesión tiene un tema diferente.",
    category: "lectura",
    age_min: 5,
    age_max: 10,
    modality: "online",
    online_link: "https://zoom.us/j/example",
    city: "Online",
    capacity_total: 30,
    price_cents: 0,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    requirements: "Conexión a internet estable. Opcional: tener el libro del mes.",
    cancellation_policy: "Actividad gratuita. Avisa si no puedes asistir.",
  },
  {
    title: "Laboratorio de Experimentos Caseros",
    short_description: "Ciencia divertida desde casa",
    description: "Taller online donde los niños realizarán experimentos increíbles con materiales que tienen en casa. Aprenderán sobre reacciones químicas, física básica y mucho más mientras se divierten. Incluye kit de materiales enviado a domicilio.",
    category: "experimentos",
    age_min: 8,
    age_max: 12,
    modality: "en-casa",
    city: "Envío a toda España",
    capacity_total: 100,
    price_cents: 2000,
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
    requirements: "Supervisión de un adulto durante los experimentos.",
    cancellation_policy: "Cancelación con devolución completa antes del envío del kit.",
  },
];

// POST - Seed the database with sample data
export async function POST(req: Request) {
  try {
    // Check for secret key to prevent accidental seeding
    const { searchParams } = new URL(req.url);
    const secretKey = searchParams.get("key");

    if (secretKey !== "peques-seed-2024") {
      return NextResponse.json(
        { ok: false, error: "Invalid seed key" },
        { status: 403 }
      );
    }

    console.log("[API] POST /api/seed - Starting database seed...");

    // Step 1: Create an organizer user
    const organizerData = {
      email: "organizador@peques.demo",
      name: "María García",
      last_name: "López",
      role: "organizador",
      email_verified: 1,
      status: "active",
    };

    const organizerResult = await totalumSdk.crud.createRecord("user", organizerData);
    const organizerId = organizerResult.data?._id;
    console.log("[API] Created organizer user:", organizerId);

    // Step 2: Create organizer profile
    const profileData = {
      user: organizerId,
      brand_name: "Pequeños Genios",
      phone: "+34 612 345 678",
      bio: "Somos un equipo de educadores apasionados por crear experiencias de aprendizaje divertidas para niños. Con más de 10 años de experiencia organizando actividades infantiles.",
      website: "https://pequeniosgenios.example.com",
      verified: "yes",
    };

    await totalumSdk.crud.createRecord("organizer_profile", profileData);
    console.log("[API] Created organizer profile");

    // Step 3: Create a parent user with children
    const parentData = {
      email: "padre@peques.demo",
      name: "Carlos",
      last_name: "Rodríguez",
      role: "padre",
      email_verified: 1,
      status: "active",
    };

    const parentResult = await totalumSdk.crud.createRecord("user", parentData);
    const parentId = parentResult.data?._id;
    console.log("[API] Created parent user:", parentId);

    // Create children
    const child1Data = {
      email: "lucia@peques.demo",
      name: "Lucía",
      last_name: "Rodríguez",
      role: "peque",
      status: "active",
    };

    const child1Result = await totalumSdk.crud.createRecord("user", child1Data);
    const child1Id = child1Result.data?._id;
    console.log("[API] Created child 1:", child1Id);

    const child2Data = {
      email: "pablo@peques.demo",
      name: "Pablo",
      last_name: "Rodríguez",
      role: "peque",
      status: "active",
    };

    const child2Result = await totalumSdk.crud.createRecord("user", child2Data);
    const child2Id = child2Result.data?._id;
    console.log("[API] Created child 2:", child2Id);

    // Create parent-child links
    await totalumSdk.crud.createRecord("parent_child_link", {
      parent_user: parentId,
      child_user: child1Id,
      pin_code: "1234",
    });

    await totalumSdk.crud.createRecord("parent_child_link", {
      parent_user: parentId,
      child_user: child2Id,
      pin_code: "5678",
    });
    console.log("[API] Created parent-child links");

    // Step 4: Create activities
    const createdActivities: string[] = [];
    const now = new Date();

    for (let i = 0; i < sampleActivities.length; i++) {
      const activity = sampleActivities[i];
      const slug = generateSlug(activity.title);

      // Set dates for sessions (some in past for completed, some in future)
      const daysOffset = i < 2 ? -7 : 7 + (i * 3); // First 2 activities in past, rest in future
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + daysOffset);
      startDate.setHours(10, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(12, 0, 0, 0);

      const activityData = {
        organizer_user: organizerId,
        title: activity.title,
        slug,
        short_description: activity.short_description,
        description: activity.description,
        category: activity.category,
        age_min: activity.age_min,
        age_max: activity.age_max,
        modality: activity.modality,
        location_name: activity.location_name || "",
        location_address: activity.location_address || "",
        city: activity.city,
        online_link: activity.online_link || "",
        start_date_time: startDate.toISOString(),
        end_date_time: endDate.toISOString(),
        capacity_total: activity.capacity_total,
        capacity_available: activity.capacity_total - (i < 2 ? 5 : 0), // Some spots taken for past activities
        price_cents: activity.price_cents,
        requirements: activity.requirements,
        cancellation_policy: activity.cancellation_policy,
        status: "published",
        visibility: "public",
        published_at: now.toISOString(),
      };

      const activityResult = await totalumSdk.crud.createRecord("activity", activityData);
      const activityId = activityResult.data?._id;
      createdActivities.push(activityId);
      console.log(`[API] Created activity: ${activity.title} (${activityId})`);

      // Create sessions for the activity (2 sessions each)
      for (let s = 0; s < 2; s++) {
        const sessionStart = new Date(startDate);
        sessionStart.setDate(sessionStart.getDate() + (s * 7)); // One week apart

        const sessionEnd = new Date(sessionStart);
        sessionEnd.setHours(12, 0, 0, 0);

        const sessionData = {
          activity: activityId,
          start_date_time: sessionStart.toISOString(),
          end_date_time: sessionEnd.toISOString(),
          capacity_total: Math.floor(activity.capacity_total / 2),
          capacity_available: Math.floor(activity.capacity_total / 2) - (i < 2 && s === 0 ? 3 : 0),
          price_cents: activity.price_cents,
          currency: "eur",
          status: "active",
        };

        await totalumSdk.crud.createRecord("activity_session", sessionData);
      }

      // Create activity stats
      const statsData = {
        activity: activityId,
        views: Math.floor(Math.random() * 500) + 50,
        clicks_reserve: Math.floor(Math.random() * 100) + 10,
        bookings_count: i < 2 ? 5 : Math.floor(Math.random() * 10),
        revenue_cents: i < 2 ? activity.price_cents * 5 : 0,
        checkins_count: i < 2 ? 4 : 0,
        last_updated_at: now.toISOString(),
      };

      await totalumSdk.crud.createRecord("activity_stats", statsData);

      // Create checklist
      const checklistData = {
        activity: activityId,
        has_title: "yes",
        has_cover: "no", // We're not uploading actual images
        has_description: "yes",
        has_session: "yes",
        has_capacity: "yes",
        has_price: "yes",
        has_location: activity.modality === "presencial" ? "yes" : "yes",
        completion_percent: 85,
      };

      await totalumSdk.crud.createRecord("activity_draft_checklist", checklistData);
    }

    // Step 5: Create some bookings for the first 2 (past) activities
    for (let i = 0; i < 2; i++) {
      const activityId = createdActivities[i];
      const activity = sampleActivities[i];

      const bookingDate = new Date(now);
      bookingDate.setDate(bookingDate.getDate() - 14); // Booked 2 weeks ago

      const bookingData = {
        activity: activityId,
        parent_user: parentId,
        child_user: child1Id,
        quantity: 2,
        status: i === 0 ? "checked_in" : "paid",
        booked_at: bookingDate.toISOString(),
      };

      const bookingResult = await totalumSdk.crud.createRecord("booking", bookingData);
      const bookingId = bookingResult.data?._id;
      console.log(`[API] Created booking for activity ${i + 1}: ${bookingId}`);

      // Create tickets
      for (let t = 0; t < 2; t++) {
        const ticketData = {
          booking: bookingId,
          ticket_code: generateTicketCode(),
          issued_at: bookingDate.toISOString(),
          status: i === 0 ? "used" : "active",
          used_at: i === 0 ? now.toISOString() : undefined,
        };

        await totalumSdk.crud.createRecord("ticket", ticketData);
      }

      // Create calendar item
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + (i < 2 ? -7 : 7 + (i * 3)));
      startDate.setHours(10, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(12, 0, 0, 0);

      await totalumSdk.crud.createRecord("calendar_item", {
        parent_user: parentId,
        activity: activityId,
        booking: bookingId,
        title: activity.title,
        start_date_time: startDate.toISOString(),
        end_date_time: endDate.toISOString(),
      });
    }

    console.log("[API] POST /api/seed - Seed completed successfully!");

    return NextResponse.json({
      ok: true,
      message: "Database seeded successfully",
      data: {
        organizer: organizerId,
        parent: parentId,
        children: [child1Id, child2Id],
        activities: createdActivities.length,
      },
    });
  } catch (err) {
    console.error("[API ERROR] POST /api/seed", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// GET - Check seed status
export async function GET() {
  try {
    // Check if there are any activities
    const activitiesResult = await totalumSdk.crud.getRecords("activity", {
      pagination: { limit: 1, page: 0 },
    });

    const hasData = activitiesResult.data && activitiesResult.data.length > 0;

    return NextResponse.json({
      ok: true,
      seeded: hasData,
      message: hasData
        ? "Database has been seeded"
        : "Database is empty. POST to /api/seed?key=peques-seed-2024 to seed.",
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/seed", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

