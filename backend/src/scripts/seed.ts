import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../app.module';
import { MerchantVerificationStatus } from '../common/enums/merchant-verification-status.enum';
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
  {
    fullName: 'Diego Farinas',
    email: 'admin@abastoboliviano.bo',
    role: Role.ADMIN,
  },
  {
    fullName: 'Lucia Quispe',
    email: 'lucia.quispe@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Marco Cardenas',
    email: 'marco.cardenas@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Elena Mamani',
    email: 'elena.mamani@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Victor Choque',
    email: 'victor.choque@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Rosa Callisaya',
    email: 'rosa.callisaya@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Nancy Flores',
    email: 'nancy.flores@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Javier Perez',
    email: 'javier.perez@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Patricia Alcon',
    email: 'patricia.alcon@abastoboliviano.bo',
    role: Role.MERCHANT,
  },
  {
    fullName: 'Mateo Veizaga',
    email: 'mateo.veizaga@abastoboliviano.bo',
    role: Role.USER,
  },
  {
    fullName: 'Andrea Nina',
    email: 'andrea.nina@abastoboliviano.bo',
    role: Role.USER,
  },
  {
    fullName: 'Sofia Loza',
    email: 'sofia.loza@abastoboliviano.bo',
    role: Role.USER,
  },
  {
    fullName: 'Carlos Medina',
    email: 'carlos.medina@abastoboliviano.bo',
    role: Role.USER,
  },
  {
    fullName: 'Fernanda Rios',
    email: 'fernanda.rios@abastoboliviano.bo',
    role: Role.USER,
  },
  {
    fullName: 'Paulo Salazar',
    email: 'paulo.salazar@abastoboliviano.bo',
    role: Role.USER,
    isActive: false,
  },
];

const merchantProfilesSeed: SeedMerchantProfile[] = [
  {
    email: 'lucia.quispe@abastoboliviano.bo',
    businessName: 'Caserita Lucía',
    ownerFullName: 'Lucia Quispe',
    phone: '72510001',
    description:
      'Puesto familiar con huevos, lacteos y abarrotes en la zona Miraflores.',
  },
  {
    email: 'marco.cardenas@abastoboliviano.bo',
    businessName: 'Distribuidora Cardenas',
    ownerFullName: 'Marco Cardenas',
    phone: '72510002',
    description:
      'Venta por mayor y detalle de verduras frescas para mercados y tiendas.',
  },
  {
    email: 'elena.mamani@abastoboliviano.bo',
    businessName: 'Frutas Elena',
    ownerFullName: 'Elena Mamani',
    phone: '72510003',
    description: 'Fruta de temporada traida de los Yungas y Cochabamba.',
  },
  {
    email: 'victor.choque@abastoboliviano.bo',
    businessName: 'Don Victor Carnes',
    ownerFullName: 'Victor Choque',
    phone: '72510004',
    description: 'Cortes de pollo, res y cerdo con venta por kilo y combos.',
  },
  {
    email: 'rosa.callisaya@abastoboliviano.bo',
    businessName: 'Abarrotes La Caserita',
    ownerFullName: 'Rosa Callisaya',
    phone: '72510005',
    description:
      'Arroz, azucar, aceite y productos de despensa para la semana.',
  },
  {
    email: 'nancy.flores@abastoboliviano.bo',
    businessName: 'Huerta Nancy',
    ownerFullName: 'Nancy Flores',
    phone: '72510006',
    description: 'Verduras organicas, hierbas aromaticas y combos saludables.',
  },
  {
    email: 'javier.perez@abastoboliviano.bo',
    businessName: 'Mercado Javier',
    ownerFullName: 'Javier Perez',
    phone: '72510007',
    description:
      'Venta mixta de lacteos, pan y abarrotes para compras rapidas.',
  },
  {
    email: 'patricia.alcon@abastoboliviano.bo',
    businessName: 'Paty Delivery Barrial',
    ownerFullName: 'Patricia Alcon',
    phone: '72510008',
    description:
      'Emprendimiento barrial con frutas y canastas armadas para familias.',
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
  'tuberculos',
  'legumbres',
  'granos',
  'condimentos',
  'hierbas',
  'fiambres',
  'limpieza',
  'parrilla',
  'pescados',
  'comida preparada',
];

const productsSeed: SeedProduct[] = [
  {
    categoryName: 'huevos',
    productName: 'huevo criollo',
    description: 'Maples de huevo criollo mediano.',
  },
  {
    categoryName: 'huevos',
    productName: 'huevo blanco',
    description: 'Huevo blanco por unidad y maple.',
  },
  {
    categoryName: 'huevos',
    productName: 'huevo de codorniz',
    description: 'Huevos pequenos para ensaladas y piqueos.',
  },
  {
    categoryName: 'verduras',
    productName: 'tomate',
    description: 'Tomate fresco para ensaladas y guisos.',
  },
  {
    categoryName: 'verduras',
    productName: 'cebolla',
    description: 'Cebolla de valle en diferentes tamanos.',
  },
  {
    categoryName: 'verduras',
    productName: 'cebolla morada',
    description: 'Cebolla morada para ensaladas y salsas.',
  },
  {
    categoryName: 'verduras',
    productName: 'lechuga',
    description: 'Lechuga fresca para ensaladas y sandwiches.',
  },
  {
    categoryName: 'verduras',
    productName: 'pepino',
    description: 'Pepino verde para ensaladas.',
  },
  {
    categoryName: 'verduras',
    productName: 'pimenton rojo',
    description: 'Pimenton dulce para guisos, rellenos y parrilla.',
  },
  {
    categoryName: 'verduras',
    productName: 'locoto',
    description: 'Locoto fresco para llajua y salsas.',
  },
  {
    categoryName: 'verduras',
    productName: 'repollo',
    description: 'Repollo para ensaladas, guarniciones y sopas.',
  },
  {
    categoryName: 'verduras',
    productName: 'coliflor',
    description: 'Coliflor fresca para sopas y salteados.',
  },
  {
    categoryName: 'verduras',
    productName: 'zapallo',
    description: 'Zapallo para sopas, guisos y cremas.',
  },
  {
    categoryName: 'verduras',
    productName: 'vainita',
    description: 'Vainita fresca para guarniciones.',
  },
  {
    categoryName: 'verduras',
    productName: 'arveja verde',
    description: 'Arveja verde para sopas y guisos.',
  },
  {
    categoryName: 'verduras',
    productName: 'papa holandesa',
    description: 'Papa ideal para guisos y frituras.',
  },
  {
    categoryName: 'verduras',
    productName: 'zanahoria',
    description: 'Zanahoria dulce para cocina diaria.',
  },
  {
    categoryName: 'tuberculos',
    productName: 'papa imilla',
    description: 'Papa imilla para sopa, horno y cocina diaria.',
  },
  {
    categoryName: 'tuberculos',
    productName: 'papa waycha',
    description: 'Papa waycha harinosa para platos paceños.',
  },
  {
    categoryName: 'tuberculos',
    productName: 'camote',
    description: 'Camote dulce para horno y guarniciones.',
  },
  {
    categoryName: 'tuberculos',
    productName: 'yuca',
    description: 'Yuca fresca para hervir, freir o acompanar parrilla.',
  },
  {
    categoryName: 'tuberculos',
    productName: 'oca',
    description: 'Oca andina para platos tradicionales.',
  },
  {
    categoryName: 'tuberculos',
    productName: 'chuño',
    description: 'Chuno seco para sopas y platos andinos.',
  },
  {
    categoryName: 'tuberculos',
    productName: 'tunta',
    description: 'Tunta blanca para platos paceños.',
  },
  {
    categoryName: 'frutas',
    productName: 'platano',
    description: 'Platano de los Yungas por mano o kilo.',
  },
  {
    categoryName: 'frutas',
    productName: 'manzana',
    description: 'Manzana roja y verde de temporada.',
  },
  {
    categoryName: 'frutas',
    productName: 'papaya',
    description: 'Papaya fresca para jugos y desayunos.',
  },
  {
    categoryName: 'frutas',
    productName: 'naranja',
    description: 'Naranja jugosa para mesa y jugos.',
  },
  {
    categoryName: 'frutas',
    productName: 'mandarina',
    description: 'Mandarina dulce de temporada.',
  },
  {
    categoryName: 'frutas',
    productName: 'limon',
    description: 'Limon fresco para salsas, jugos y cocina.',
  },
  {
    categoryName: 'frutas',
    productName: 'palta',
    description: 'Palta cremosa para ensaladas y sandwiches.',
  },
  {
    categoryName: 'frutas',
    productName: 'piña',
    description: 'Pina fresca para jugos y postres.',
  },
  {
    categoryName: 'frutas',
    productName: 'frutilla',
    description: 'Frutilla de temporada para postres y jugos.',
  },
  {
    categoryName: 'frutas',
    productName: 'sandia',
    description: 'Sandia fresca por unidad o tajada.',
  },
  {
    categoryName: 'frutas',
    productName: 'melon',
    description: 'Melon dulce para desayunos.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'arroz',
    description: 'Arroz popular de 1 y 5 kilos.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'aceite',
    description: 'Aceite vegetal sellado en botella.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'azucar',
    description: 'Azucar blanca refinada y morena.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'fideo',
    description: 'Fideo para sopa y guarnicion.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'sal',
    description: 'Sal yodada para cocina diaria.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'harina',
    description: 'Harina de trigo para panaderia y reposteria.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'avena',
    description: 'Avena para desayuno y bebidas calientes.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'cafe molido',
    description: 'Cafe molido para desayuno.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'te',
    description: 'Te en caja para infusiones.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'mermelada',
    description: 'Mermelada de fruta para pan y postres.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'miel',
    description: 'Miel natural para bebidas y desayunos.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'atun en lata',
    description: 'Atun en lata para comidas rapidas.',
  },
  {
    categoryName: 'abarrotes',
    productName: 'sardina en lata',
    description: 'Sardina en conserva para despensa.',
  },
  {
    categoryName: 'granos',
    productName: 'quinua',
    description: 'Quinua real para sopas, pesque y guarniciones.',
  },
  {
    categoryName: 'granos',
    productName: 'maiz pelado',
    description: 'Maiz pelado para mote y sopas.',
  },
  {
    categoryName: 'granos',
    productName: 'trigo pelado',
    description: 'Trigo pelado para sopas y guisos.',
  },
  {
    categoryName: 'granos',
    productName: 'chia',
    description: 'Chia para desayunos y jugos.',
  },
  {
    categoryName: 'legumbres',
    productName: 'lenteja',
    description: 'Lenteja seca para guisos y sopas.',
  },
  {
    categoryName: 'legumbres',
    productName: 'garbanzo',
    description: 'Garbanzo seco para ensaladas y guisos.',
  },
  {
    categoryName: 'legumbres',
    productName: 'poroto',
    description: 'Poroto seco para platos familiares.',
  },
  {
    categoryName: 'legumbres',
    productName: 'haba seca',
    description: 'Haba seca para sopas tradicionales.',
  },
  {
    categoryName: 'legumbres',
    productName: 'mani',
    description: 'Mani para sopa, salsa y snacks.',
  },
  {
    categoryName: 'lacteos',
    productName: 'leche',
    description: 'Leche entera en sachet y botella.',
  },
  {
    categoryName: 'lacteos',
    productName: 'queso fresco',
    description: 'Queso fresco valluno por pieza.',
  },
  {
    categoryName: 'lacteos',
    productName: 'yogur natural',
    description: 'Yogur natural artesanal.',
  },
  {
    categoryName: 'lacteos',
    productName: 'mantequilla',
    description: 'Mantequilla para cocina y panaderia.',
  },
  {
    categoryName: 'lacteos',
    productName: 'crema de leche',
    description: 'Crema de leche para salsas y postres.',
  },
  {
    categoryName: 'lacteos',
    productName: 'queso criollo',
    description: 'Queso criollo para humintas, sopas y desayunos.',
  },
  {
    categoryName: 'carnicos',
    productName: 'pollo entero',
    description: 'Pollo fresco entero por unidad.',
  },
  {
    categoryName: 'carnicos',
    productName: 'carne molida',
    description: 'Carne molida de res por kilo.',
  },
  {
    categoryName: 'carnicos',
    productName: 'costilla de cerdo',
    description: 'Costilla fresca para horno y parrilla.',
  },
  {
    categoryName: 'carnicos',
    productName: 'carne de res',
    description: 'Carne de res fresca por kilo.',
  },
  {
    categoryName: 'carnicos',
    productName: 'bife de res',
    description: 'Bife de res para plancha y parrilla.',
  },
  {
    categoryName: 'carnicos',
    productName: 'costilla de res',
    description: 'Costilla de res para sopa y parrilla.',
  },
  {
    categoryName: 'carnicos',
    productName: 'chuleta de cerdo',
    description: 'Chuleta de cerdo para parrilla o sarten.',
  },
  {
    categoryName: 'carnicos',
    productName: 'chorizo parrillero',
    description: 'Chorizo para parrilladas y choripan.',
  },
  {
    categoryName: 'carnicos',
    productName: 'alita de pollo',
    description: 'Alitas de pollo para freir u hornear.',
  },
  {
    categoryName: 'carnicos',
    productName: 'pechuga de pollo',
    description: 'Pechuga fresca para comidas ligeras.',
  },
  {
    categoryName: 'carnicos',
    productName: 'charque',
    description: 'Charque para platos tradicionales.',
  },
  {
    categoryName: 'fiambres',
    productName: 'jamon',
    description: 'Jamon para sandwiches y desayunos.',
  },
  {
    categoryName: 'fiambres',
    productName: 'mortadela',
    description: 'Mortadela para sandwiches.',
  },
  {
    categoryName: 'fiambres',
    productName: 'salchicha',
    description: 'Salchicha para hot dogs y platos rapidos.',
  },
  {
    categoryName: 'pescados',
    productName: 'trucha',
    description: 'Trucha fresca para plancha y horno.',
  },
  {
    categoryName: 'pescados',
    productName: 'pejerrey',
    description: 'Pejerrey fresco para fritura.',
  },
  {
    categoryName: 'panaderia',
    productName: 'pan marraqueta',
    description: 'Marraqueta recien horneada.',
  },
  {
    categoryName: 'panaderia',
    productName: 'pan integral',
    description: 'Pan integral artesanal.',
  },
  {
    categoryName: 'panaderia',
    productName: 'pan sarnita',
    description: 'Pan sarnita tradicional.',
  },
  {
    categoryName: 'panaderia',
    productName: 'pan molde',
    description: 'Pan molde para sandwiches.',
  },
  {
    categoryName: 'panaderia',
    productName: 'empanada de queso',
    description: 'Empanada de queso horneada.',
  },
  {
    categoryName: 'panaderia',
    productName: 'pastel de queso',
    description: 'Pastel frito de queso para desayuno.',
  },
  {
    categoryName: 'panaderia',
    productName: 'galleta de agua',
    description: 'Galleta de agua para te y desayuno.',
  },
  {
    categoryName: 'bebidas',
    productName: 'jugo de naranja',
    description: 'Jugo natural en botella.',
  },
  {
    categoryName: 'bebidas',
    productName: 'refresco de mocochinchi',
    description: 'Refresco tradicional listo para servir.',
  },
  {
    categoryName: 'bebidas',
    productName: 'api morado',
    description: 'Api morado caliente listo para servir.',
  },
  {
    categoryName: 'bebidas',
    productName: 'tojori',
    description: 'Tojori caliente tradicional.',
  },
  {
    categoryName: 'bebidas',
    productName: 'agua mineral',
    description: 'Agua mineral en botella.',
  },
  {
    categoryName: 'bebidas',
    productName: 'gaseosa',
    description: 'Gaseosa familiar y personal.',
  },
  {
    categoryName: 'condimentos',
    productName: 'pimienta',
    description: 'Pimienta molida para sazonar.',
  },
  {
    categoryName: 'condimentos',
    productName: 'comino',
    description: 'Comino molido para cocina tradicional.',
  },
  {
    categoryName: 'condimentos',
    productName: 'oregano',
    description: 'Oregano seco para sopas y carnes.',
  },
  {
    categoryName: 'condimentos',
    productName: 'aji colorado',
    description: 'Aji colorado molido para saice, fricase y guisos.',
  },
  {
    categoryName: 'condimentos',
    productName: 'aji amarillo',
    description: 'Aji amarillo para salsas y guisos.',
  },
  {
    categoryName: 'condimentos',
    productName: 'vinagre',
    description: 'Vinagre para escabeches y ensaladas.',
  },
  {
    categoryName: 'condimentos',
    productName: 'mayonesa',
    description: 'Mayonesa para sandwiches y ensaladas.',
  },
  {
    categoryName: 'condimentos',
    productName: 'ketchup',
    description: 'Ketchup para papas y comidas rapidas.',
  },
  {
    categoryName: 'hierbas',
    productName: 'cilantro',
    description: 'Cilantro fresco para llajua y sopas.',
  },
  {
    categoryName: 'hierbas',
    productName: 'perejil',
    description: 'Perejil fresco para sazonar.',
  },
  {
    categoryName: 'hierbas',
    productName: 'hierbabuena',
    description: 'Hierbabuena para infusiones y sopas.',
  },
  {
    categoryName: 'hierbas',
    productName: 'huacataya',
    description: 'Huacataya fresca para salsas y platos andinos.',
  },
  {
    categoryName: 'parrilla',
    productName: 'carbon',
    description: 'Carbon vegetal para parrilladas.',
  },
  {
    categoryName: 'parrilla',
    productName: 'lena',
    description: 'Lena seca para horno y parrilla.',
  },
  {
    categoryName: 'parrilla',
    productName: 'brochetas de pollo',
    description: 'Brochetas listas para parrilla.',
  },
  {
    categoryName: 'parrilla',
    productName: 'llajua preparada',
    description: 'Llajua lista para acompanar comidas.',
  },
  {
    categoryName: 'comida preparada',
    productName: 'ensalada preparada',
    description: 'Ensalada lista para acompanar almuerzos.',
  },
  {
    categoryName: 'comida preparada',
    productName: 'sopa de mani',
    description: 'Sopa de mani preparada por porcion.',
  },
  {
    categoryName: 'comida preparada',
    productName: 'salteña',
    description: 'Saltena fresca de carne o pollo.',
  },
  {
    categoryName: 'limpieza',
    productName: 'detergente',
    description: 'Detergente para limpieza del hogar.',
  },
  {
    categoryName: 'limpieza',
    productName: 'lavandina',
    description: 'Lavandina para limpieza y desinfeccion.',
  },
  {
    categoryName: 'limpieza',
    productName: 'jabon de lavar',
    description: 'Jabon de lavar ropa y utensilios.',
  },
  {
    categoryName: 'frutas',
    productName: 'uva',
    description: 'Uva morada para mesa y jugo.',
    isActive: false,
  },
  {
    categoryName: 'verduras',
    productName: 'brocoli',
    description: 'Brocoli fresco de invernadero.',
    isActive: false,
  },
];

const offersSeed: SeedOffer[] = [
  {
    merchantEmail: 'lucia.quispe@abastoboliviano.bo',
    productName: 'huevo criollo',
    saleType: SaleType.TRAY,
    approximateQuantity: 38,
    price: 29,
    latitude: -16.5005,
    longitude: -68.1225,
    locationDescription:
      'Cerca del mercado de Miraflores, sobre la avenida principal.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'lucia.quispe@abastoboliviano.bo',
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
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
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
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
    productName: 'cebolla',
    saleType: SaleType.UNIT,
    approximateQuantity: 95,
    price: 4.5,
    latitude: -16.518,
    longitude: -68.1385,
    locationDescription:
      'Detras del surtidor, junto a dos puestos de verduras.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
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
    merchantEmail: 'elena.mamani@abastoboliviano.bo',
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
    merchantEmail: 'elena.mamani@abastoboliviano.bo',
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
    merchantEmail: 'elena.mamani@abastoboliviano.bo',
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
    merchantEmail: 'victor.choque@abastoboliviano.bo',
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
    merchantEmail: 'victor.choque@abastoboliviano.bo',
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
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
    productName: 'arroz',
    saleType: SaleType.UNIT,
    approximateQuantity: 85,
    price: 8.5,
    latitude: -16.506,
    longitude: -68.1297,
    locationDescription:
      'Tienda de barrio con puerta guinda y letrero de ofertas.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
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
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
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
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
    productName: 'zanahoria',
    saleType: SaleType.UNIT,
    approximateQuantity: 66,
    price: 3.8,
    latitude: -16.5408,
    longitude: -68.0899,
    locationDescription:
      'Huerta urbana con sombrilla verde y cajas de plastico.',
    availableFrom: '2026-06-18T10:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
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
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
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
    merchantEmail: 'javier.perez@abastoboliviano.bo',
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
    merchantEmail: 'javier.perez@abastoboliviano.bo',
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
    merchantEmail: 'javier.perez@abastoboliviano.bo',
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
    merchantEmail: 'victor.choque@abastoboliviano.bo',
    productName: 'carne de res',
    saleType: SaleType.UNIT,
    approximateQuantity: 36,
    price: 48,
    latitude: -16.4877,
    longitude: -68.1319,
    locationDescription: 'Cortes frescos para parrilla en vitrina refrigerada.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastoboliviano.bo',
    productName: 'bife de res',
    saleType: SaleType.UNIT,
    approximateQuantity: 24,
    price: 58,
    latitude: -16.488,
    longitude: -68.1328,
    locationDescription: 'Bifes cortados al momento para parrillada.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastoboliviano.bo',
    productName: 'costilla de res',
    saleType: SaleType.UNIT,
    approximateQuantity: 18,
    price: 45,
    latitude: -16.4894,
    longitude: -68.1316,
    locationDescription: 'Costilla de res especial para sopa o parrilla.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastoboliviano.bo',
    productName: 'chorizo parrillero',
    saleType: SaleType.UNIT,
    approximateQuantity: 52,
    price: 28,
    latitude: -16.4902,
    longitude: -68.1337,
    locationDescription: 'Chorizos frescos por paquete para parrilla.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastoboliviano.bo',
    productName: 'chuleta de cerdo',
    saleType: SaleType.UNIT,
    approximateQuantity: 26,
    price: 38,
    latitude: -16.4907,
    longitude: -68.1326,
    locationDescription: 'Chuletas listas para sarten o brasas.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
    productName: 'carbon',
    saleType: SaleType.UNIT,
    approximateQuantity: 40,
    price: 18,
    latitude: -16.5051,
    longitude: -68.1314,
    locationDescription: 'Bolsas de carbon cerca al ingreso de la tienda.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
    productName: 'gaseosa',
    saleType: SaleType.UNIT,
    approximateQuantity: 65,
    price: 12,
    latitude: -16.5042,
    longitude: -68.1301,
    locationDescription: 'Gaseosas familiares frias para compartir.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
    productName: 'yuca',
    saleType: SaleType.UNIT,
    approximateQuantity: 42,
    price: 5.5,
    latitude: -16.5405,
    longitude: -68.0889,
    locationDescription: 'Yuca fresca en canastas junto a tuberculos.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
    productName: 'lechuga',
    saleType: SaleType.UNIT,
    approximateQuantity: 48,
    price: 3,
    latitude: -16.5399,
    longitude: -68.0901,
    locationDescription: 'Lechugas lavadas para ensalada del dia.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
    productName: 'pepino',
    saleType: SaleType.UNIT,
    approximateQuantity: 57,
    price: 2.5,
    latitude: -16.5409,
    longitude: -68.091,
    locationDescription: 'Pepinos frescos en caja verde.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
    productName: 'palta',
    saleType: SaleType.UNIT,
    approximateQuantity: 33,
    price: 7,
    latitude: -16.5416,
    longitude: -68.0917,
    locationDescription: 'Paltas medianas maduras para ensalada.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
    productName: 'pimenton rojo',
    saleType: SaleType.UNIT,
    approximateQuantity: 44,
    price: 4,
    latitude: -16.517,
    longitude: -68.1348,
    locationDescription: 'Pimentones dulces por unidad y docena.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
    productName: 'locoto',
    saleType: SaleType.UNIT,
    approximateQuantity: 80,
    price: 1.5,
    latitude: -16.5186,
    longitude: -68.1362,
    locationDescription: 'Locotos frescos para llajua.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
    productName: 'cilantro',
    saleType: SaleType.UNIT,
    approximateQuantity: 70,
    price: 1,
    latitude: -16.5167,
    longitude: -68.1373,
    locationDescription: 'Ramos de cilantro y perejil frescos.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
    productName: 'perejil',
    saleType: SaleType.UNIT,
    approximateQuantity: 64,
    price: 1,
    latitude: -16.5179,
    longitude: -68.1379,
    locationDescription: 'Ramos frescos para sopas y ensaladas.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'lucia.quispe@abastoboliviano.bo',
    productName: 'queso criollo',
    saleType: SaleType.UNIT,
    approximateQuantity: 19,
    price: 20,
    latitude: -16.5012,
    longitude: -68.122,
    locationDescription: 'Queso criollo fresco junto a lacteos.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T19:30:00.000Z',
  },
  {
    merchantEmail: 'lucia.quispe@abastoboliviano.bo',
    productName: 'mantequilla',
    saleType: SaleType.UNIT,
    approximateQuantity: 34,
    price: 9,
    latitude: -16.5002,
    longitude: -68.1232,
    locationDescription: 'Mantequilla refrigerada para desayuno.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T19:30:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastoboliviano.bo',
    productName: 'pan sarnita',
    saleType: SaleType.UNIT,
    approximateQuantity: 95,
    price: 0.8,
    latitude: -16.4928,
    longitude: -68.1466,
    locationDescription: 'Pan fresco desde temprano para desayuno.',
    availableFrom: '2026-06-18T06:00:00.000Z',
    availableUntil: '2026-06-18T13:00:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastoboliviano.bo',
    productName: 'pastel de queso',
    saleType: SaleType.UNIT,
    approximateQuantity: 48,
    price: 3.5,
    latitude: -16.4932,
    longitude: -68.1448,
    locationDescription: 'Pasteles calientes con api morado.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T11:00:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastoboliviano.bo',
    productName: 'api morado',
    saleType: SaleType.UNIT,
    approximateQuantity: 60,
    price: 4,
    latitude: -16.4936,
    longitude: -68.1445,
    locationDescription: 'Api morado caliente servido en vaso.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T11:00:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastoboliviano.bo',
    productName: 'jamon',
    saleType: SaleType.UNIT,
    approximateQuantity: 22,
    price: 16,
    latitude: -16.4946,
    longitude: -68.1458,
    locationDescription: 'Jamon en lonjas para sandwiches.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'javier.perez@abastoboliviano.bo',
    productName: 'pan molde',
    saleType: SaleType.UNIT,
    approximateQuantity: 28,
    price: 12,
    latitude: -16.494,
    longitude: -68.1475,
    locationDescription: 'Pan molde para sandwiches familiares.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'elena.mamani@abastoboliviano.bo',
    productName: 'naranja',
    saleType: SaleType.UNIT,
    approximateQuantity: 120,
    price: 1.2,
    latitude: -16.5219,
    longitude: -68.1111,
    locationDescription: 'Naranjas jugosas por bolsa o unidad.',
    availableFrom: '2026-06-18T08:30:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'elena.mamani@abastoboliviano.bo',
    productName: 'limon',
    saleType: SaleType.UNIT,
    approximateQuantity: 95,
    price: 1,
    latitude: -16.5228,
    longitude: -68.1117,
    locationDescription: 'Limones frescos para jugos y llajua.',
    availableFrom: '2026-06-18T08:30:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'elena.mamani@abastoboliviano.bo',
    productName: 'frutilla',
    saleType: SaleType.UNIT,
    approximateQuantity: 30,
    price: 10,
    latitude: -16.5208,
    longitude: -68.1102,
    locationDescription: 'Frutillas frescas por bandeja.',
    availableFrom: '2026-06-18T08:30:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
    productName: 'fideo',
    saleType: SaleType.UNIT,
    approximateQuantity: 75,
    price: 6,
    latitude: -16.5064,
    longitude: -68.1302,
    locationDescription: 'Fideos para sopa y guarnicion en estante central.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
    productName: 'quinua',
    saleType: SaleType.UNIT,
    approximateQuantity: 32,
    price: 16,
    latitude: -16.5058,
    longitude: -68.1288,
    locationDescription: 'Quinua real embolsada de medio kilo.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
    productName: 'lenteja',
    saleType: SaleType.UNIT,
    approximateQuantity: 38,
    price: 9,
    latitude: -16.5068,
    longitude: -68.1291,
    locationDescription: 'Legumbres secas por libra y kilo.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'rosa.callisaya@abastoboliviano.bo',
    productName: 'mani',
    saleType: SaleType.UNIT,
    approximateQuantity: 25,
    price: 14,
    latitude: -16.5045,
    longitude: -68.1286,
    locationDescription: 'Mani pelado para sopa y salsa.',
    availableFrom: '2026-06-18T07:30:00.000Z',
    availableUntil: '2026-06-18T21:00:00.000Z',
  },
  {
    merchantEmail: 'nancy.flores@abastoboliviano.bo',
    productName: 'zapallo',
    saleType: SaleType.UNIT,
    approximateQuantity: 18,
    price: 12,
    latitude: -16.542,
    longitude: -68.0895,
    locationDescription: 'Zapallos medianos para sopa familiar.',
    availableFrom: '2026-06-18T09:00:00.000Z',
    availableUntil: '2026-06-18T18:30:00.000Z',
  },
  {
    merchantEmail: 'marco.cardenas@abastoboliviano.bo',
    productName: 'arveja verde',
    saleType: SaleType.UNIT,
    approximateQuantity: 46,
    price: 6,
    latitude: -16.5191,
    longitude: -68.1389,
    locationDescription: 'Arveja verde desgranada para guisos.',
    availableFrom: '2026-06-18T06:30:00.000Z',
    availableUntil: '2026-06-18T16:30:00.000Z',
  },
  {
    merchantEmail: 'lucia.quispe@abastoboliviano.bo',
    productName: 'miel',
    saleType: SaleType.UNIT,
    approximateQuantity: 20,
    price: 25,
    latitude: -16.5016,
    longitude: -68.1217,
    locationDescription: 'Miel natural para desayuno y mates.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T19:30:00.000Z',
  },
  {
    merchantEmail: 'lucia.quispe@abastoboliviano.bo',
    productName: 'avena',
    saleType: SaleType.UNIT,
    approximateQuantity: 36,
    price: 8,
    latitude: -16.5007,
    longitude: -68.1208,
    locationDescription: 'Avena para desayuno en bolsa sellada.',
    availableFrom: '2026-06-18T07:00:00.000Z',
    availableUntil: '2026-06-18T19:30:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastoboliviano.bo',
    productName: 'pechuga de pollo',
    saleType: SaleType.UNIT,
    approximateQuantity: 31,
    price: 36,
    latitude: -16.4872,
    longitude: -68.1342,
    locationDescription: 'Pechuga fresca deshuesada por kilo.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'victor.choque@abastoboliviano.bo',
    productName: 'alita de pollo',
    saleType: SaleType.UNIT,
    approximateQuantity: 45,
    price: 24,
    latitude: -16.4898,
    longitude: -68.1349,
    locationDescription: 'Alitas marinadas y naturales para horno.',
    availableFrom: '2026-06-18T08:00:00.000Z',
    availableUntil: '2026-06-18T18:00:00.000Z',
  },
  {
    merchantEmail: 'patricia.alcon@abastoboliviano.bo',
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
    const merchantProfilesRepository =
      dataSource.getRepository(MerchantProfile);
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
    console.log(`- Admin: admin@abastoboliviano.bo / ${ADMIN_PASSWORD}`);
    console.log(
      `- Comerciante: lucia.quispe@abastoboliviano.bo / ${DEFAULT_PASSWORD}`,
    );
    console.log(
      `- Usuario: mateo.veizaga@abastoboliviano.bo / ${DEFAULT_PASSWORD}`,
    );
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

  return new Map(
    savedCategories.map((category) => [category.categoryName, category]),
  );
}

async function seedProducts(
  productsRepository: Repository<Product>,
  categoryMap: Map<string, Category>,
) {
  const products = productsSeed.map((item) => {
    const category = categoryMap.get(item.categoryName);

    if (!category) {
      throw new Error(
        `Categoria no encontrada para producto: ${item.productName}`,
      );
    }

    return productsRepository.create({
      productName: item.productName,
      description: item.description,
      category,
      isActive: item.isActive ?? true,
    });
  });

  const savedProducts = await productsRepository.save(products);

  return new Map(
    savedProducts.map((product) => [product.productName, product]),
  );
}

async function seedMerchantProfiles(
  merchantProfilesRepository: Repository<MerchantProfile>,
  userMap: Map<string, User>,
) {
  const profiles = merchantProfilesSeed.map((item) => {
    const user = userMap.get(item.email.toLowerCase());

    if (!user) {
      throw new Error(
        `Usuario no encontrado para perfil comercial: ${item.email}`,
      );
    }

    return merchantProfilesRepository.create({
      user,
      businessName: item.businessName,
      ownerFullName: item.ownerFullName,
      phone: item.phone,
      description: item.description,
      verificationStatus: MerchantVerificationStatus.APPROVED,
      reviewNotes: 'Perfil aprobado por seed para entorno de pruebas.',
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
    const merchantProfile = merchantProfileMap.get(
      item.merchantEmail.toLowerCase(),
    );
    const product = productMap.get(item.productName);

    if (!merchantProfile) {
      throw new Error(
        `Perfil comercial no encontrado para oferta: ${item.merchantEmail}`,
      );
    }

    if (!product) {
      throw new Error(
        `Producto no encontrado para oferta: ${item.productName}`,
      );
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
      availableUntil: item.availableUntil
        ? new Date(item.availableUntil)
        : null,
      isActive: item.isActive ?? true,
    });
  });

  return offersRepository.save(offers);
}

void bootstrap();
