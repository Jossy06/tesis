import { NestFactory } from "@nestjs/core";
import { DataSource, Repository } from "typeorm";

import { AppModule } from "../app.module";

import { ServiceCategory } from "../service-categories/entities/service-category.entity";
import { ServiceGroup } from "../service-groups/entities/service-group.entity";
import { BeautyService } from "../services/entities/service.entity";
import { Material } from "../materials/entities/material.entity";
import { ServiceMaterial } from "../service-materials/entities/service-material.entity";

/**
 * Seeder compatible con las entidades reales del proyecto.
 *
 * Entidades:
 * - ServiceCategory
 * - ServiceGroup
 * - BeautyService
 * - Material
 * - ServiceMaterial
 *
 * El seeder es idempotente: actualiza registros existentes y evita duplicados.
 */

type CategorySeed = {
  name: string;
  icon: string;
  color: string;
};

type GroupSeed = {
  category: string;
  name: string;
  icon: string;
  sort: number;
};

type ServiceSeed = {
  category: string;

  group: string;

  name: string;

  description: string;

  price: number;
};

type MaterialSeed = {
  name: string;

  unit: string;

  unit_price: number;

  stock: number;
};

type ServiceMaterialSeed = {
  service: string;

  material: string;

  quantity: number;
};

const categories: CategorySeed[] = [
  {
    name: "Uñas",

    icon: "💅",

    color: "#ec2f86",
  },

  {
    name: "Cabello",

    icon: "💇‍♀️",

    color: "#9c5de5",
  },

  {
    name: "Pestañas",

    icon: "👁️",

    color: "#f15bb5",
  },

  {
    name: "Cejas",

    icon: "✨",

    color: "#00bbf9",
  },

  {
    name: "Facial",

    icon: "🧖‍♀️",

    color: "#00f5d4",
  },
];

const groups: GroupSeed[] = [
  {
    category: "Uñas",

    name: "Sistema",

    icon: "💅",

    sort: 1,
  },

  {
    category: "Uñas",

    name: "Técnica",

    icon: "🎨",

    sort: 2,
  },

  {
    category: "Uñas",

    name: "Formas",

    icon: "⬜",

    sort: 3,
  },

  {
    category: "Uñas",

    name: "Largo",

    icon: "📏",

    sort: 4,
  },

  {
    category: "Uñas",

    name: "Adicionales",

    icon: "✨",

    sort: 5,
  },

  {
    category: "Cabello",

    name: "Servicio",

    icon: "💇‍♀️",

    sort: 1,
  },

  {
    category: "Cabello",

    name: "Adicionales",

    icon: "✨",

    sort: 2,
  },

  {
    category: "Pestañas",

    name: "Sistema",

    icon: "👁️",

    sort: 1,
  },

  {
    category: "Pestañas",

    name: "Técnicas",

    icon: "👁️",

    sort: 2,
  },

  {
    category: "Pestañas",

    name: "Adicionales",

    icon: "✨",

    sort: 3,
  },

  {
    category: "Cejas",

    name: "Servicio",

    icon: "✨",

    sort: 1,
  },

  {
    category: "Facial",

    name: "Tratamiento",

    icon: "🧖‍♀️",

    sort: 1,
  },
];

const nailTechniques: string[] = [
  'Frances',
  'Baby French',
  'Baby Boomer',
  'Efecto espejo (Aurora, Unicornio)',
  'Cat Eye',
  'Mandalas',
  'Papel oro',
  'Encapsulado',
  'Stamping',
  'Animal Print',
  'Mármol',
  'Degradado',
  'Efecto azúcar',
  'Chrome',
];

function normalizeSeedText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getNailTechniquePrice(name: string): number {
  const normalized = normalizeSeedText(name);


  const advancedKeywords = [
    "encapsulado",
    "cat eye",
    "chrome",
  ];

  if (advancedKeywords.some((keyword) => normalized.includes(keyword))) {
    return 1.5;
  }

  const intermediateKeywords = [
    "frances",
    "baby boomer",
    "papel oro",
    "mandalas",
    "marmol",
    "degradado",
    "efecto azucar",
  ];

  if (intermediateKeywords.some((keyword) => normalized.includes(keyword))) {
    return 1;
  }

  return 0.75;
}

const services: ServiceSeed[] = [
  // UÑAS: SISTEMA

  {
    category: "Uñas",

    group: "Sistema",

    name: "Manicure tradicional",

    description: "Limpieza, limado y esmaltado tradicional.",

    price: 8,
  },

  {
    category: "Uñas",

    group: "Sistema",

    name: "Semipermanente",

    description: "Esmaltado semipermanente.",

    price: 12,
  },

  {
    category: "Uñas",

    group: "Sistema",

    name: "Acrílico",

    description: "Aplicación de uñas acrílicas.",

    price: 20,
  },

  {
    category: "Uñas",

    group: "Sistema",

    name: "Soft Gel",

    description: "Extensión de uñas con tips Soft Gel.",

    price: 18,
  },

  {
    category: "Uñas",

    group: "Sistema",

    name: "Polygel",

    description: "Aplicación de uñas con polygel.",

    price: 17,
  },

  {
    category: "Uñas",

    group: "Sistema",

    name: "Gel de construcción",

    description: "Nivelación o extensión con gel de construcción.",

    price: 18,
  },

  // UÑAS: TÉCNICAS

  ...nailTechniques.map((name): ServiceSeed => ({
    category: "Uñas",

    group: "Técnica",

    name,

    description: `Técnica de uñas: ${name}`,

    price: getNailTechniquePrice(name),
  })),

  // UÑAS: FORMAS

  ...[
    "Cuadrada",
    "Redonda",
    "Ovalada",
    "Almendra",
    "Coffin",
    "Stiletto",
    "Ballerina",
    "Squoval",
  ].map((name): ServiceSeed => ({
    category: "Uñas",

    group: "Formas",

    name,

    description: `Forma de uña: ${name}`,

    price: 0,
  })),

  // UÑAS: LARGO

  ...[
    { name: "Largo natural", price: 1 },

    { name: "Largo 1", price: 1 },

    { name: "Largo 2", price: 2 },

    { name: "Largo 3", price: 4 },

    { name: "Largo 4", price: 6 },

    { name: "Largo 5 o superior", price: 8 },
  ].map((item): ServiceSeed => ({
    category: "Uñas",

    group: "Largo",

    name: item.name,

    description: `Longitud seleccionada: ${item.name}`,

    price: item.price,
  })),

  // UÑAS: ADICIONALES

  ...[
    { name: "Retiro de semipermanente", price: 3 },

    { name: "Retiro de acrílico", price: 5 },

    { name: "Retiro de Soft Gel", price: 5 },

    { name: "Retiro de polygel", price: 5 },

    { name: "Reposición de una uña", price: 2 },

    { name: "Nivelación", price: 4 },

    { name: "Refuerzo de uña natural", price: 4 },

    { name: "Reparación de uña", price: 2 },

    { name: "Diseño por uña", price: 1 },

    { name: "Diseño en todas las uñas", price: 5 },
  ].map((item): ServiceSeed => ({
    category: "Uñas",

    group: "Adicionales",

    name: item.name,

    description: item.name,

    price: item.price,
  })),

  // CABELLO

  ...[
    { group: "Servicio", name: "Corte de cabello", price: 10 },

    { group: "Servicio", name: "Lavado y secado", price: 8 },

    { group: "Servicio", name: "Cepillado", price: 10 },

    { group: "Servicio", name: "Plancha", price: 8 },

    { group: "Servicio", name: "Ondas", price: 12 },

    { group: "Servicio", name: "Peinado", price: 15 },

    { group: "Servicio", name: "Tinte completo", price: 35 },

    { group: "Servicio", name: "Retoque de raíz", price: 20 },

    { group: "Servicio", name: "Mechas", price: 45 },

    { group: "Servicio", name: "Balayage", price: 60 },

    { group: "Servicio", name: "Tratamiento capilar", price: 15 },

    { group: "Adicionales", name: "Cabello largo", price: 5 },

    { group: "Adicionales", name: "Cabello abundante", price: 5 },

    { group: "Adicionales", name: "Decoloración adicional", price: 15 },
  ].map((item): ServiceSeed => ({
    category: "Cabello",

    group: item.group,

    name: item.name,

    description: item.name,

    price: item.price,
  })),

  // PESTAÑAS

  ...[
    { group: "Sistema", name: "Híbridas", price: 25 },

    { group: "Sistema", name: "Volumen ruso", price: 30 },

    { group: "Sistema", name: "Mega volumen", price: 35 },

    { group: "Sistema", name: "Efecto rímel", price: 25 },

    { group: "Sistema", name: "Efecto mojado", price: 28 },

    { group: "Sistema", name: "Efecto wispy", price: 30 },

    { group: "Técnicas", name: "Clásicas", price: 20 },

    { group: "Técnicas", name: "Volumen 2D", price: 25 },

    { group: "Técnicas", name: "Volumen 3D", price: 30 },

    { group: "Adicionales", name: "Retiro de pestañas", price: 5 },

    { group: "Adicionales", name: "Retoque", price: 15 },
  ].map((item): ServiceSeed => ({
    category: "Pestañas",

    group: item.group,

    name: item.name,

    description: item.name,

    price: item.price,
  })),

  // CEJAS

  ...[
    { name: "Diseño de cejas", price: 5 },

    { name: "Depilación con pinza", price: 5 },

    { name: "Depilación con cera", price: 6 },

    { name: "Pigmentación con henna", price: 10 },

    { name: "Laminado de cejas", price: 15 },
  ].map((item): ServiceSeed => ({
    category: "Cejas",

    group: "Servicio",

    name: item.name,

    description: item.name,

    price: item.price,
  })),

  // FACIAL

  ...[
    { name: "Limpieza facial básica", price: 15 },

    { name: "Limpieza facial profunda", price: 25 },

    { name: "Hidratación facial", price: 18 },

    { name: "Exfoliación facial", price: 15 },

    { name: "Mascarilla facial", price: 10 },
  ].map((item): ServiceSeed => ({
    category: "Facial",

    group: "Tratamiento",

    name: item.name,

    description: item.name,

    price: item.price,
  })),
];

const materials: MaterialSeed[] = [
  { name: "Base coat", unit: "ml", unit_price: 0.08, stock: 100 },

  { name: "Top coat", unit: "ml", unit_price: 0.1, stock: 100 },

  { name: "Esmalte semipermanente", unit: "ml", unit_price: 0.12, stock: 200 },

  { name: "Monómero", unit: "ml", unit_price: 0.05, stock: 500 },

  { name: "Polvo acrílico", unit: "g", unit_price: 0.08, stock: 300 },

  { name: "Tip Soft Gel", unit: "unidad", unit_price: 0.15, stock: 500 },

  { name: "Gel adhesivo", unit: "ml", unit_price: 0.1, stock: 100 },

  { name: "Polygel", unit: "g", unit_price: 0.12, stock: 200 },

  { name: "Gel de construcción", unit: "g", unit_price: 0.11, stock: 200 },

  { name: "Primer", unit: "ml", unit_price: 0.07, stock: 100 },

  { name: "Deshidratador", unit: "ml", unit_price: 0.05, stock: 100 },

  { name: "Lima", unit: "unidad", unit_price: 0.5, stock: 100 },

  { name: "Buffer", unit: "unidad", unit_price: 0.4, stock: 100 },

  { name: "Algodón", unit: "unidad", unit_price: 0.02, stock: 1000 },

  { name: "Acetona", unit: "ml", unit_price: 0.01, stock: 1000 },

  { name: "Glitter", unit: "g", unit_price: 0.1, stock: 100 },

  { name: "Foil", unit: "unidad", unit_price: 0.2, stock: 100 },

  { name: "Cristales", unit: "unidad", unit_price: 0.08, stock: 500 },
];

const serviceMaterials: ServiceMaterialSeed[] = [
  { service: "Semipermanente", material: "Base coat", quantity: 1 },

  { service: "Semipermanente", material: "Top coat", quantity: 1 },

  {
    service: "Semipermanente",
    material: "Esmalte semipermanente",
    quantity: 2,
  },

  { service: "Semipermanente", material: "Primer", quantity: 0.5 },

  { service: "Semipermanente", material: "Deshidratador", quantity: 0.5 },

  { service: "Acrílico", material: "Monómero", quantity: 10 },

  { service: "Acrílico", material: "Polvo acrílico", quantity: 8 },

  { service: "Acrílico", material: "Primer", quantity: 1 },

  { service: "Acrílico", material: "Deshidratador", quantity: 1 },

  { service: "Acrílico", material: "Lima", quantity: 0.15 },

  { service: "Acrílico", material: "Buffer", quantity: 0.15 },

  { service: "Soft Gel", material: "Tip Soft Gel", quantity: 10 },

  { service: "Soft Gel", material: "Gel adhesivo", quantity: 2 },

  { service: "Soft Gel", material: "Primer", quantity: 1 },

  { service: "Soft Gel", material: "Deshidratador", quantity: 1 },

  { service: "Polygel", material: "Polygel", quantity: 8 },

  { service: "Polygel", material: "Primer", quantity: 1 },

  { service: "Polygel", material: "Deshidratador", quantity: 1 },

  {
    service: "Gel de construcción",
    material: "Gel de construcción",
    quantity: 8,
  },

  { service: "Gel de construcción", material: "Primer", quantity: 1 },

  { service: "Gel de construcción", material: "Deshidratador", quantity: 1 },

];

async function findOrCreateCategory(
  repository: Repository<ServiceCategory>,

  item: CategorySeed,
): Promise<ServiceCategory> {
  let category = await repository.findOne({ where: { name: item.name } });

  if (!category) {
    category = repository.create({
      ...item,

      is_active: true,
    });
  } else {
    repository.merge(category, {
      ...item,

      is_active: true,
    });
  }

  return repository.save(category);
}

async function findOrCreateGroup(
  repository: Repository<ServiceGroup>,

  item: GroupSeed,

  category: ServiceCategory,
): Promise<ServiceGroup> {
  let group = await repository.findOne({
    where: {
      name: item.name,

      category_id: category.id,
    },
  });

  const values = {
    name: item.name,
    icon: item.icon,
    sort: item.sort,
    category,
    category_id: category.id,
    is_active: true,
  };

  if (!group) {
    group = repository.create(values);
  } else {
    repository.merge(group, values);
  }

  return repository.save(group);
}

async function findOrCreateService(
  repository: Repository<BeautyService>,

  item: ServiceSeed,

  category: ServiceCategory,

  group: ServiceGroup,
): Promise<BeautyService> {
  let service = await repository.findOne({
    where: {
      name: item.name,

      group_id: group.id,
    },
  });

  const values = {
    name: item.name,

    description: item.description,

    base_price: item.price,

    category,

    category_id: category.id,

    group,

    group_id: group.id,
  };

  if (!service) {
    service = repository.create(values);
  } else {
    repository.merge(service, values);
  }

  return repository.save(service);
}

async function findOrCreateMaterial(
  repository: Repository<Material>,

  item: MaterialSeed,
): Promise<Material> {
  let material = await repository.findOne({
    where: { name: item.name },
  });

  const values = {
    ...item,
  };

  if (!material) {
    material = repository.create(values);
  } else {
    repository.merge(material, values);
  }

  return repository.save(material);
}

async function seed(dataSource: DataSource): Promise<void> {
  const categoryRepository = dataSource.getRepository(ServiceCategory);

  const groupRepository = dataSource.getRepository(ServiceGroup);

  const serviceRepository = dataSource.getRepository(BeautyService);

  const materialRepository = dataSource.getRepository(Material);

  const serviceMaterialRepository = dataSource.getRepository(ServiceMaterial);

  const categoryMap = new Map<string, ServiceCategory>();

  const groupMap = new Map<string, ServiceGroup>();

  const serviceMap = new Map<string, BeautyService>();

  const materialMap = new Map<string, Material>();

  console.log("1/5 Cargando categorías...");

  for (const item of categories) {
    const category = await findOrCreateCategory(categoryRepository, item);

    categoryMap.set(item.name, category);
  }

  console.log("2/5 Cargando grupos...");

  for (const item of groups) {
    const category = categoryMap.get(item.category);

    if (!category) {
      throw new Error(`No se encontró la categoría "${item.category}".`);
    }

    const group = await findOrCreateGroup(groupRepository, item, category);

    groupMap.set(`${item.category}::${item.name}`, group);
  }

  console.log("3/5 Cargando servicios y técnicas...");

  for (const item of services) {
    const category = categoryMap.get(item.category);

    const group = groupMap.get(`${item.category}::${item.group}`);

    if (!category) {
      throw new Error(`No se encontró la categoría "${item.category}".`);
    }

    if (!group) {
      throw new Error(
        `No se encontró el grupo "${item.group}" de "${item.category}".`,
      );
    }

    const service = await findOrCreateService(
      serviceRepository,

      item,

      category,

      group,
    );

    serviceMap.set(item.name, service);
  }

  console.log("4/5 Cargando materiales...");

  for (const item of materials) {
    const material = await findOrCreateMaterial(materialRepository, item);

    materialMap.set(item.name, material);
  }

  console.log("5/5 Cargando relaciones servicio-material...");

  for (const item of serviceMaterials) {
    const service = serviceMap.get(item.service);

    const material = materialMap.get(item.material);

    if (!service || !material) {
      console.warn(
        `Relación omitida: servicio="${item.service}", material="${item.material}".`,
      );

      continue;
    }

    let relation = await serviceMaterialRepository.findOne({
      where: {
        service_id: service.id,

        material_id: material.id,
      },
    });

    const values = {
      service,

      service_id: service.id,

      material,

      material_id: material.id,

      quantity: item.quantity,
    };

    if (!relation) {
      relation = serviceMaterialRepository.create(values);
    } else {
      serviceMaterialRepository.merge(relation, values);
    }

    await serviceMaterialRepository.save(relation);
  }

  console.log("Seeder completado correctamente.");

  console.log(`Categorías: ${categories.length}`);

  console.log(`Grupos: ${groups.length}`);

  console.log(`Técnicas de uñas: ${nailTechniques.length}`);

  console.log(`Servicios totales: ${services.length}`);

  console.log(`Materiales: ${materials.length}`);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log"],
  });

  try {
    const dataSource = app.get(DataSource);

    console.log("Iniciando carga de datos...");

    await seed(dataSource);

    console.log("Seeder completado correctamente.");
  } catch (error) {
    console.error("Error ejecutando el seeder:", error);

    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();