import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../app.module';
import { Role } from '../common/enums/role.enum';
import { SaleType } from '../common/enums/sale-type.enum';
import { Category } from '../modules/categories/entities/category.entity';
import { MerchantProfile } from '../modules/merchant-profiles/entities/merchant-profile.entity';
import { Offer } from '../modules/offers/entities/offer.entity';
import { Product } from '../modules/products/entities/product.entity';
import { User } from '../modules/users/entities/user.entity';

type SeedUser = {
  fullName: string;
  email: string;
  role: Role;
  isActive?: boolean;
};

type SeedMerchantProfile = {
  email: string;
  businessName: string;
  ownerFullName: string;
  phone: string;
  description: string;
  isActive?: boolean;
};

type SeedProduct = {
  categoryName: string;
  productName: string;
  description: string;
  isActive?: boolean;
};

type SeedOffer = {
  merchantEmail: string;
  productName: string;
  saleType: SaleType;
  approximateQuantity: number | null;
  price: number | null;
  latitude: number;
  longitude: number;
  locationDescription: string;
  availableFrom: string | null;
  availableUntil: string | null;
  isActive?: boolean;
};

const DEFAULT_PASSWORD = 'abasto123';
const ADMIN_PASSWORD = 'admin123';

const usersSeed: SeedUser[] = [
  { fullName: 'Diego Farinas', email: 'admin@abastopaceno.bo', role: Role.ADMIN },
  { fullName: 'Lucia Quispe', email: 'lucia.quispe@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Marco Cardenas', email: 'marco.cardenas@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Elena Mamani', email: 'elena.mamani@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Victor Choque', email: 'victor.choque@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Rosa Callisaya', email: 'rosa.callisaya@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Nancy Flores', email: 'nancy.flores@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Javier Perez', email: 'javier.perez@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Patricia Alcon', email: 'patricia.alcon@abastopaceno.bo', role: Role.MERCHANT },
  { fullName: 'Mateo Veizaga', email: 'mateo.veizaga@abastopaceno.bo', role: Role.USER },
  { fullName: 'Andrea Nina', email: 'andrea.nina@abastopaceno.bo', role: Role.USER },
  { fullName: 'Sofia Loza', email: 'sofia.loza@abastopaceno.bo', role: Role.USER },
  { fullName: 'Carlos Medina', email: 'carlos.medina@abastopaceno.bo', role: Role.USER },
  { fullName: 'Fernanda Rios', email: 'fernanda.rios@abastopaceno.bo', role: Role.USER },
  { fullName: 'Paulo Salazar', email: 'paulo.salazar@abastopaceno.bo', role: Role.USER, isActive: false },
];

const merchantProfilesSeed: SeedMerchantProfile[] = [
  {
    email: 'lucia.quispe@abastopaceno.bo',
    businessName: 'Caserita Lucía',
    ownerFullName: 'Lucia Quispe',
    phone: '72510001',
    description: 'Puesto familiar con huevos, lacteos y abarrotes en la zona Miraflores.',
  },
  {
    email: 'marco.cardenas@abastopaceno.bo',
    businessName: 'Distribuidora Cardenas',
    ownerFullName: 'Marco Cardenas',
    phone: '72510002',
    description: 'Venta por mayor y detalle de verduras frescas para mercados y tiendas.',
  },
  {
    email: 'elena.mamani@abastopaceno.bo',
    businessName: 'Frutas Elena',
    ownerFullName: 'Elena Mamani',
    phone: '72510003',
    description: 'Fruta de temporada traida de los Yungas y Cochabamba.',
  },
  {
    email: 'victor.choque@abastopaceno.bo',
    businessName: 'Don Victor Carnes',
    ownerFullName: 'Victor Choque',
    phone: '72510004',
    description: 'Cortes de pollo, res y cerdo con venta por kilo y combos.',
  },
  {
    email: 'rosa.callisaya@abastopaceno.bo',
    businessName: 'Abarrotes La Caserita',
    ownerFullName: 'Rosa Callisaya',
    phone: '72510005',
    description: 'Arroz, azucar, aceite y productos de despensa para la semana.',
  },
  {
    email: 'nancy.flores@abastopaceno.bo',
    businessName: 'Huerta Nancy',
    ownerFullName: 'Nancy Flores',
    phone: '72510006',
    description: 'Verduras organicas, hierbas aromaticas y combos saludables.',
  },
  {
    email: 'javier.perez@abastopaceno.bo',
    businessName: 'Mercado Javier',
    ownerFullName: 'Javier Perez',
    phone: '72510007',
    description: 'Venta mixta de lacteos, pan y abarrotes para compras rapidas.',
  },
  {
    email: 'patricia.alcon@abastopaceno.bo',
    businessName: 'Paty Delivery Barrial',
    ownerFullName: 'Patricia Alcon',
    phone: '72510008',
    description: 'Emprendimiento barrial con frutas y canastas armadas para familias.',
    isActive: false,
  },
];

const categoriesSeed = [
  'huevos',
  'verduras',
  'frutas',
  'abarrotes',
  'lacteos',
  'carnicos',
  'panaderia',
  'bebidas',
];

const productsSeed: SeedProduct[] = [
  { categoryName: 'huevos', productName: 'huevo criollo', description: 'Maples de huevo criollo mediano.' },
  { categoryName: 'huevos', productName: 'huevo blanco', description: 'Huevo blanco por unidad y maple.' },
  { categoryName: 'verduras', productName: 'tomate', description: 'Tomate fresco para ensaladas y guisos.' },
  { categoryName: 'verduras', productName: 'cebolla', description: 'Cebolla de valle en diferentes tamanos.' },
  { categoryName: 'verduras', productName: 'papa holandesa', description: 'Papa ideal para guisos y frituras.' },
  { categoryName: 'verduras', productName: 'zanahoria', description: 'Zanahoria dulce para cocina diaria.' },
  { categoryName: 'frutas', productName: 'platano', description: 'Platano de los Yungas por mano o kilo.' },
  { categoryName: 'frutas', productName: 'manzana', description: 'Manzana roja y verde de temporada.' },
  { categoryName: 'frutas', productName: 'papaya', description: 'Papaya fresca para jugos y desayunos.' },
  { categoryName: 'abarrotes', productName: 'arroz', description: 'Arroz popular de 1 y 5 kilos.' },
  { categoryName: 'abarrotes', productName: 'aceite', description: 'Aceite vegetal sellado en botella.' },
  { categoryName: 'abarrotes', productName: 'azucar', description: 'Azucar blanca refinada y morena.' },
  { categoryName: 'lacteos', productName: 'leche', description: 'Leche entera en sachet y botella.' },
  { categoryName: 'lacteos', productName: 'queso fresco', description: 'Queso fresco valluno por pieza.' },
  { categoryName: 'lacteos', productName: 'yogur natural', description: 'Yogur natural artesanal.' },
  { categoryName: 'carnicos', productName: 'pollo entero', description: 'Pollo fresco entero por unidad.' },
  { categoryName: 'carnicos', productName: 'carne molida', description: 'Carne molida de res por kilo.' },
  { categoryName: 'carnicos', productName: 'costilla de cerdo', description: 'Costilla fresca para horno y parrilla.' },
  { categoryName: 'panaderia', productName: 'pan marraqueta', description: 'Marraqueta recien horneada.' },
  { categoryName: 'panaderia', productName: 'pan integral', description: 'Pan integral artesanal.' },
  { categoryName: 'bebidas', productName: 'jugo de naranja', description: 'Jugo natural en botella.' },
  { categoryName: 'bebidas', productName: 'refresco de mocochinchi', description: 'Refresco tradicional listo para servir.' },
  { categoryName: 'frutas', productName: 'uva', description: 'Uva morada para mesa y jugo.', isActive: false },
  { categoryName: 'verduras', productName: 'brocoli', description: 'Brocoli fresco de invernadero.', isActive: false },
];

const offersSeed: SeedOffer[] = [
  {
    merchantEmail: 'lucia.quispe@abastopaceno.bo',
    productName: 'huevo criollo',
    saleType: SaleType.TRAY,
    approximateQuantity: 38,
    price: 29,
    latitude: -16.5005,
    longitude: -68.1225,
    locationDescription: 'Cerca del mercado de Miraflores, sobre la avenida principal.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'lucia.quispe@abastopaceno.bo',
    productName: 'leche',
    saleType: SaleType.UNIT,
    approximateQuantity: 55,
    price: 6.5,
    latitude: -16.5009,
    longitude: -68.1212,
    locationDescription: 'Puesto esquinero con banner rojo frente a la plaza.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T20:00:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastopaceno.bo',
    productName: 'tomate',
    saleType: SaleType.UNIT,
    approximateQuantity: 140,
    price: 5,
    latitude: -16.5174,
    longitude: -68.1367,
    locationDescription: 'Camioneta verde estacionada cerca del puente.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastopaceno.bo',
    productName: 'cebolla',
    saleType: SaleType.UNIT,
    approximateQuantity: 95,
    price: 4.5,
    latitude: -16.518,
    longitude: -68.1385,
    locationDescription: 'Detras del surtidor, junto a dos puestos de verduras.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastopaceno.bo',
    productName: 'papa holandesa',
    saleType: SaleType.UNIT,
    approximateQuantity: 110,
    price: 4.2,
    latitude: -16.5161,
    longitude: -68.1352,
    locationDescription: 'Puesto techado con lona azul cerca del cruce.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'elena.mamani@abastopaceno.bo',
    productName: 'platano',
    saleType: SaleType.UNIT,
    approximateQuantity: 90,
    price: 2.5,
    latitude: -16.5213,
    longitude: -68.1114,
    locationDescription: 'Canastas amarillas junto a la parada de minibuses.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'elena.mamani@abastopaceno.bo',
    productName: 'papaya',
    saleType: SaleType.UNIT,
    approximateQuantity: 35,
    price: 10,
    latitude: -16.5224,
    longitude: -68.1107,
    locationDescription: 'Puesto con mantel naranja frente a la panaderia.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'elena.mamani@abastopaceno.bo',
    productName: 'manzana',
    saleType: SaleType.UNIT,
    approximateQuantity: 70,
    price: 4,
    latitude: -16.5231,
    longitude: -68.112,
    locationDescription: 'Cerca de la esquina con letrero de frutas frescas.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastopaceno.bo',
    productName: 'pollo entero',
    saleType: SaleType.UNIT,
    approximateQuantity: 42,
    price: 33,
    latitude: -16.4884,
    longitude: -68.1331,
    locationDescription: 'Frente al mercado barrial, mostrador refrigerado.',
    availableFrom: '2026-06-18T08:30:00.000Z',
    availableUntil: '2026-06-18T17:30:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastopaceno.bo',
    productName: 'carne molida',
    saleType: SaleType.UNIT,
    approximateQuantity: 28,
    price: 42,
    latitude: -16.4891,
    longitude: -68.1324,
    locationDescription: 'Puesto frio con balanza digital y cartel blanco.',
    availableFrom: '2026-06-18T08:30:00.000Z',
    availableUntil: '2026-06-18T17:30:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastopaceno.bo',
    productName: 'arroz',
    saleType: SaleType.UNIT,
    approximateQuantity: 85,
    price: 8.5,
    latitude: -16.506,
    longitude: -68.1297,
    locationDescription: 'Tienda de barrio con puerta guinda y letrero de ofertas.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastopaceno.bo',
    productName: 'aceite',
    saleType: SaleType.UNIT,
    approximateQuantity: 44,
    price: 14.5,
    latitude: -16.5055,
    longitude: -68.1308,
    locationDescription: 'Mostrador interior visible desde la avenida.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastopaceno.bo',
    productName: 'azucar',
    saleType: SaleType.UNIT,
    approximateQuantity: 60,
    price: 7.2,
    latitude: -16.5048,
    longitude: -68.1293,
    locationDescription: 'Mini mercado con estantes al ingreso.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastopaceno.bo',
    productName: 'zanahoria',
    saleType: SaleType.UNIT,
    approximateQuantity: 66,
    price: 3.8,
    latitude: -16.5408,
    longitude: -68.0899,
    locationDescription: 'Huerta urbana con sombrilla verde y cajas de plastico.',
    availableFrom: '2026-06-18T10:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastopaceno.bo',
    productName: 'brocoli',
    saleType: SaleType.UNIT,
    approximateQuantity: 24,
    price: 6,
    latitude: -16.5412,
    longitude: -68.0905,
    locationDescription: 'Puesto pequeño junto a la entrada del pasaje.',
    availableFrom: '2026-06-18T10:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
    isActive: false,
  },
  {
    merchantEmail: 'nancy.flores@abastopaceno.bo',
    productName: 'yogur natural',
    saleType: SaleType.UNIT,
    approximateQuantity: 18,
    price: 12,
    latitude: -16.5402,
    longitude: -68.0914,
    locationDescription: 'Refrigerador pequeno al lado de la caja principal.',
    availableFrom: '2026-06-18T10:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastopaceno.bo',
    productName: 'pan marraqueta',
    saleType: SaleType.UNIT,
    approximateQuantity: 120,
    price: 0.7,
    latitude: -16.4934,
    longitude: -68.147,
    locationDescription: 'Kiosko junto a la parada final del trufi.',
    availableFrom: '2026-06-18T06:00:00.000Z',
    availableUntil: '2026-06-18T13:00:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastopaceno.bo',
    productName: 'queso fresco',
    saleType: SaleType.UNIT,
    approximateQuantity: 22,
    price: 18,
    latitude: -16.4942,
    longitude: -68.1461,
    locationDescription: 'Refrigerador blanco y vitrina de lacteos.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastopaceno.bo',
    productName: 'refresco de mocochinchi',
    saleType: SaleType.UNIT,
    approximateQuantity: 30,
    price: 5,
    latitude: -16.4938,
    longitude: -68.1453,
    locationDescription: 'Botellas heladas al lado del mostrador principal.',
    availableFrom: '2026-06-18T10:00:00.000Z',
    availableUntil: '2026-06-18T17:00:00.000Z',
  },
  {
    merchantEmail: 'patricia.alcon@abastopaceno.bo',
    productName: 'uva',
    saleType: SaleType.UNIT,
    approximateQuantity: 17,
    price: 12,
    latitude: -16.5105,
    longitude: -68.1185,
    locationDescription: 'Canastas moradas cerca al modulo de reparto.',
    availableFrom: '2026-06-18T11:00:00.000Z',
    availableUntil: '2026-06-18T16:00:00.000Z',
    isActive: false,
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);

    await truncateData(dataSource);

    const usersRepository = dataSource.getRepository(User);
    const categoriesRepository = dataSource.getRepository(Category);
    const productsRepository = dataSource.getRepository(Product);
    const merchantProfilesRepository = dataSource.getRepository(MerchantProfile);
    const offersRepository = dataSource.getRepository(Offer);

    const userMap = await seedUsers(usersRepository);
    const categoryMap = await seedCategories(categoriesRepository);
    const productMap = await seedProducts(productsRepository, categoryMap);
    const merchantProfileMap = await seedMerchantProfiles(
      merchantProfilesRepository,
      userMap,
    );
    const offers = await seedOffers(
      offersRepository,
      merchantProfileMap,
      productMap,
    );

    console.log('');
    console.log('Seed completado correctamente.');
    console.log(`Usuarios creados: ${userMap.size}`);
    console.log(`Perfiles comerciales creados: ${merchantProfileMap.size}`);
    console.log(`Categorias creadas: ${categoryMap.size}`);
    console.log(`Productos creados: ${productMap.size}`);
    console.log(`Ofertas creadas: ${offers.length}`);
    console.log('');
    console.log('Credenciales sugeridas para pruebas:');
    console.log(`- Admin: admin@abastopaceno.bo / ${ADMIN_PASSWORD}`);
    console.log(`- Comerciante: lucia.quispe@abastopaceno.bo / ${DEFAULT_PASSWORD}`);
    console.log(`- Usuario: mateo.veizaga@abastopaceno.bo / ${DEFAULT_PASSWORD}`);
  } catch (error) {
    console.error('Error al ejecutar el seed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

async function truncateData(dataSource: DataSource) {
  await dataSource.query(
    'TRUNCATE TABLE "offers", "merchantProfiles", "products", "categories", "users" RESTART IDENTITY CASCADE',
  );
}

async function seedUsers(usersRepository: Repository<User>) {
  const passwordHashes = {
    [Role.ADMIN]: await bcrypt.hash(ADMIN_PASSWORD, 10),
    [Role.MERCHANT]: await bcrypt.hash(DEFAULT_PASSWORD, 10),
    [Role.USER]: await bcrypt.hash(DEFAULT_PASSWORD, 10),
  };

  const users = usersSeed.map((item) =>
    usersRepository.create({
      fullName: item.fullName,
      email: item.email.toLowerCase(),
      passwordHash: passwordHashes[item.role],
      role: item.role,
      isActive: item.isActive ?? true,
    }),
  );

  const savedUsers = await usersRepository.save(users);

  return new Map(savedUsers.map((user) => [user.email, user]));
}

async function seedCategories(categoriesRepository: Repository<Category>) {
  const categories = categoriesSeed.map((categoryName) =>
    categoriesRepository.create({
      categoryName,
      isActive: true,
    }),
  );

  const savedCategories = await categoriesRepository.save(categories);

  return new Map(savedCategories.map((category) => [category.categoryName, category]));
}

async function seedProducts(
  productsRepository: Repository<Product>,
  categoryMap: Map<string, Category>,
) {
  const products = productsSeed.map((item) => {
    const category = categoryMap.get(item.categoryName);

    if (!category) {
      throw new Error(`Categoria no encontrada para producto: ${item.productName}`);
    }

    return productsRepository.create({
      productName: item.productName,
      description: item.description,
      category,
      isActive: item.isActive ?? true,
    });
  });

  const savedProducts = await productsRepository.save(products);

  return new Map(savedProducts.map((product) => [product.productName, product]));
}

async function seedMerchantProfiles(
  merchantProfilesRepository: Repository<MerchantProfile>,
  userMap: Map<string, User>,
) {
  const profiles = merchantProfilesSeed.map((item) => {
    const user = userMap.get(item.email.toLowerCase());

    if (!user) {
      throw new Error(`Usuario no encontrado para perfil comercial: ${item.email}`);
    }

    return merchantProfilesRepository.create({
      user,
      businessName: item.businessName,
      ownerFullName: item.ownerFullName,
      phone: item.phone,
      description: item.description,
      isActive: item.isActive ?? true,
    });
  });

  const savedProfiles = await merchantProfilesRepository.save(profiles);

  return new Map(savedProfiles.map((profile) => [profile.user.email, profile]));
}

async function seedOffers(
  offersRepository: Repository<Offer>,
  merchantProfileMap: Map<string, MerchantProfile>,
  productMap: Map<string, Product>,
) {
  const offers = offersSeed.map((item) => {
    const merchantProfile = merchantProfileMap.get(item.merchantEmail.toLowerCase());
    const product = productMap.get(item.productName);

    if (!merchantProfile) {
      throw new Error(`Perfil comercial no encontrado para oferta: ${item.merchantEmail}`);
    }

    if (!product) {
      throw new Error(`Producto no encontrado para oferta: ${item.productName}`);
    }

    return offersRepository.create({
      merchantProfile,
      product,
      saleType: item.saleType,
      approximateQuantity: item.approximateQuantity,
      price: item.price !== null ? item.price.toFixed(2) : null,
      latitude: item.latitude.toFixed(7),
      longitude: item.longitude.toFixed(7),
      locationDescription: item.locationDescription,
      availableFrom: item.availableFrom ? new Date(item.availableFrom) : null,
      availableUntil: item.availableUntil ? new Date(item.availableUntil) : null,
      isActive: item.isActive ?? true,
    });
  });

  return offersRepository.save(offers);
}

void bootstrap();
