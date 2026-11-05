export interface CommercialProps extends Record<string, unknown> {
  title: string;
  subtitle?: string;
  description: string;
  brandName?: string;
  accentColor: string;
  badgeText?: string;
  statsValue?: string;
  statsLabel?: string;
  callToAction?: string;
  template?: "commercial" | "success-case" | "reel";
}

export const defaultCommercialProps: CommercialProps = {
  title: "Tu publicidad en video, al instante.",
  subtitle: "Imprenta de Video Automatizada",
  description: "Diseño premium de alta conversión con tecnología Remotion para anuncios 9:16 Ultra HD.",
  brandName: "ZYRVAE MEDIA STUDIO",
  accentColor: "#6366f1",
  badgeText: "Comercial ZYRVAE",
  statsValue: "+300%",
  statsLabel: "Conversión de Marca",
  callToAction: "Potencia tu Negocio Hoy",
  template: "commercial",
};
