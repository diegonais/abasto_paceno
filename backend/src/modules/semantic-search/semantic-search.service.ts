import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { OffersService } from '../offers/offers.service';
import { ProductsService } from '../products/products.service';
import type { Product } from '../products/entities/product.entity';

type GeminiSemanticResponse = {
  intent?: unknown;
  products?: unknown;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);
  private readonly geminiModel = 'gemini-2.5-flash';

  constructor(
    private readonly configService: ConfigService,
    private readonly offersService: OffersService,
    private readonly productsService: ProductsService,
  ) {}

  async search(rawQuery: string) {
    const query = rawQuery.trim();
    const catalog = await this.productsService.findAllActive();

    if (!catalog.length) {
      return {
        intent: query,
        products: [],
        offers: [],
        fallback: false,
        message: 'No hay productos activos en el catalogo.',
      };
    }

    const geminiResult = await this.resolveProductsWithGemini(query, catalog);
    const resolvedProducts =
      geminiResult.products.length > 0
        ? geminiResult.products
        : this.resolveProductsWithTextSearch(query, catalog);
    const productIds = resolvedProducts.map((product) => product.id);
    const offers =
      await this.offersService.findMapOffersByProductIds(productIds);

    return {
      intent: geminiResult.intent || query,
      products: resolvedProducts.map((product) => product.productName),
      offers,
      fallback: geminiResult.fallback,
      message: geminiResult.fallback
        ? 'No pudimos interpretar la busqueda con IA; mostramos coincidencias por texto.'
        : undefined,
    };
  }

  private async resolveProductsWithGemini(query: string, catalog: Product[]) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      return {
        intent: query,
        products: [],
        fallback: true,
      };
    }

    try {
      const geminiResponse = await this.callGemini(apiKey, query, catalog);
      const parsedResponse = this.parseGeminiResponse(geminiResponse);
      const products = this.validateGeminiProducts(parsedResponse, catalog);

      return {
        intent:
          typeof parsedResponse.intent === 'string'
            ? parsedResponse.intent.trim()
            : query,
        products,
        fallback: false,
      };
    } catch (error) {
      this.logger.warn(
        `Semantic search Gemini fallback: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return {
        intent: query,
        products: [],
        fallback: true,
      };
    }
  }

  private async callGemini(apiKey: string, query: string, catalog: Product[]) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${apiKey}`;
    const catalogNames = catalog.map((product) => product.productName);
    const prompt = [
      'El usuario esta buscando productos en una aplicacion de ofertas de alimentos en La Paz, Bolivia.',
      'Interpreta la intencion de busqueda y devuelve productos relacionados usando unicamente el catalogo proporcionado.',
      'No inventes productos. No uses categorias genericas si hay productos especificos.',
      'Devuelve solo JSON valido con esta estructura: { "intent": string, "products": string[] }.',
      `Busqueda del usuario: ${query}`,
      `Catalogo disponible: ${JSON.stringify(catalogNames)}`,
    ].join('\n');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini request failed');
    }

    return (await response.json()) as GeminiGenerateContentResponse;
  }

  private parseGeminiResponse(response: GeminiGenerateContentResponse) {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error('Gemini returned an empty response');
    }

    return JSON.parse(text) as GeminiSemanticResponse;
  }

  private validateGeminiProducts(
    response: GeminiSemanticResponse,
    catalog: Product[],
  ) {
    if (!Array.isArray(response.products)) {
      return [];
    }

    const catalogByName = new Map(
      catalog.map((product) => [
        this.normalizeText(product.productName),
        product,
      ]),
    );
    const seenProductIds = new Set<string>();

    return response.products.reduce<Product[]>((products, productName) => {
      if (typeof productName !== 'string') {
        return products;
      }

      const product = catalogByName.get(this.normalizeText(productName));

      if (!product || seenProductIds.has(product.id)) {
        return products;
      }

      seenProductIds.add(product.id);
      products.push(product);
      return products;
    }, []);
  }

  private resolveProductsWithTextSearch(query: string, catalog: Product[]) {
    const normalizedQuery = this.normalizeText(query);
    const tokens = normalizedQuery
      .split(' ')
      .filter((token) => token.length > 2);

    if (!tokens.length) {
      return [];
    }

    return catalog.filter((product) => {
      const productName = this.normalizeText(product.productName);
      return (
        normalizedQuery.includes(productName) ||
        tokens.some((token) => productName.includes(token))
      );
    });
  }

  private normalizeText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
