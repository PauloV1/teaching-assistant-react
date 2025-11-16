export type Grade = 'MANA' | 'MPA' | 'MA';
type Meta = string;

export class DefMedia {
    private readonly conceito_peso: Map<Grade, number>; // MA, MPA, MANA
    private readonly meta_peso: Map<Meta, number>; // "Gerência de Configuração", "Gerência de Projeto", etc.
    private readonly somaPesosMeta: number;

    constructor(conceitoPesoInicial: Map<Grade, number>, metaPesoInicial: Map<Meta, number>) 
    {
        // congela os maps depois de criados
        this.conceito_peso = new Map(Object.entries(conceitoPesoInicial) as [Grade, number][]);
        this.meta_peso = new Map(Object.entries(metaPesoInicial) as [Meta, number][]);

        // pré-computa a soma dos pesos das metas (denominador)
        this.somaPesosMeta = Array.from(metaPesoInicial).reduce((acc, v) => acc + v[1], 0);

        if (this.somaPesosMeta === 0)
            throw new Error("A soma dos pesos das metas não pode ser zero.");
    }

    /**
     * Calcula a média ponderada das notas do aluno.
     * @param metaNotas Map com as metas e as notas alcançadas.
     * @returns A média ponderada como número.
    */
    calc(metaNotas: Map<Meta, Grade>): number 
    {
        let somaTotal = 0;

        for (const [meta, conceito] of metaNotas.entries()) 
        {
            const pesoConceito = this.conceito_peso.get(conceito)!;
            const pesoMeta = this.meta_peso.get(meta)!;
            somaTotal += pesoMeta * pesoConceito;
        }

        return somaTotal / this.somaPesosMeta;
    }

    // Exporta dados apenas em formato serializável
    toJSON() 
    {
        const serializeMap = <K>(map: Map<K, number>) =>
            Array.from(map, ([key, value]) => ({ key, value }));

        return {
            conceitoPeso: serializeMap(this.conceito_peso),
            metaPeso: serializeMap(this.meta_peso)
        };
    }

    // Reconstrói uma instância a partir de dados serializados
    static fromJSON(data: any): DefMedia {
        const deserializeMap = (arr: { key: string; value: number }[]) =>
            new Map(arr.map(entry => [entry.key, entry.value]));

        return new DefMedia(
            deserializeMap(data.conceitoPeso) as Map<Grade, number>,
            deserializeMap(data.metaPeso) as Map<Meta, number>
        );
    }
}
