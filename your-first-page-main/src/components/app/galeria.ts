import type { AppCapture } from "@/lib/hooks/useAppContent";
import splash from "@/assets/app/splash.jpg";
import preguntas from "@/assets/app/dos/06.jpg";
import victor from "@/assets/app/dos/07.jpg";
import estela from "@/assets/app/dos/09.jpg";
import vinculo from "@/assets/app/dos/12.jpg";
import conversacion from "@/assets/app/dos/13.jpg";
import carta from "@/assets/app/galeria/carta.jpg";
import planetas from "@/assets/app/galeria/planetas.jpg";
import marte from "@/assets/app/galeria/marte.jpg";
import nucleo from "@/assets/app/galeria/nucleo.jpg";
import dinamicas from "@/assets/app/galeria/dinamicas.jpg";
import amor from "@/assets/app/galeria/amor.jpg";
import amorMenu from "@/assets/app/galeria/amor-menu.jpg";
import proposito from "@/assets/app/galeria/proposito.jpg";
import relaciones from "@/assets/app/galeria/relaciones.jpg";
import transitos from "@/assets/app/galeria/transitos.jpg";
import clima from "@/assets/app/galeria/clima.jpg";
import cielo from "@/assets/app/galeria/cielo.jpg";
import climaMio from "@/assets/app/galeria/clima-mio.jpg";
import sol from "@/assets/app/galeria/sol.jpg";
import solLectura from "@/assets/app/galeria/sol-lectura.jpg";
import identidadMenu from "@/assets/app/galeria/identidad-menu.jpg";
import laboral from "@/assets/app/galeria/laboral.jpg";
import informe1 from "@/assets/app/galeria/informe-a.jpg";
import informe2 from "@/assets/app/galeria/informe-b.jpg";

/** Fotos de la galería. Van alternadas para que el pase no se quede en el mismo tipo de pantalla. */
export const GALLERY_FRAMES: AppCapture[] = [
  { id: "splash", src: splash, alt: "Venus, edición limitada. Consulta personalizada de astrología emocional." },
  { id: "gal-carta", src: carta, alt: "Carta natal de Begoña, con Sol, ascendente y planetas." },
  { id: "gal-victor", src: victor, alt: "Sinastría con Víctor: compatibilidad, atracción y lenguaje del amor." },
  { id: "gal-transitos", src: transitos, alt: "Tránsitos del día: luna, retrógrados y aspectos del cielo." },
  { id: "gal-identidad", src: identidadMenu, alt: "Informe de identidad, con los apartados de la carta." },
  { id: "gal-planetas", src: planetas, alt: "Planetas exteriores, elementos y proporción de la carta." },
  { id: "gal-cielo", src: cielo, alt: "El cielo de hoy aplicado a los puntos natales." },
  { id: "gal-amor", src: amor, alt: "Informe Yo en el amor: la forma de amar." },
  { id: "gal-estela", src: estela, alt: "Sinastría con Estela: afinidad, intimidad y disfrute." },
  { id: "gal-clima", src: clima, alt: "Clima astral del día, la lectura general del cielo." },
  { id: "gal-marte", src: marte, alt: "Lectura de Marte en Aries dentro de la carta." },
  { id: "gal-preguntas", src: preguntas, alt: "Bienvenida al chat, con preguntas sobre el propósito." },
  { id: "gal-informe-1", src: informe1, alt: "Primera página del informe natal en PDF." },
  { id: "gal-conversacion", src: conversacion, alt: "Conversación con Venus: qué se busca en las relaciones, con su respuesta." },
  { id: "gal-proposito", src: proposito, alt: "Informe de propósito y karma." },
  { id: "gal-clima-mio", src: climaMio, alt: "Clima astral personalizado para el día de hoy." },
  { id: "gal-laboral", src: laboral, alt: "Informe del mundo laboral y los talentos." },
  { id: "gal-sol", src: sol, alt: "Elementos de la carta y lectura del Sol en Cáncer." },
  { id: "gal-relaciones", src: relaciones, alt: "Informe Yo en mis relaciones." },
  { id: "gal-informe-2", src: informe2, alt: "Página del informe natal sobre cómo te presentas al mundo." },
  { id: "gal-vinculo", src: vinculo, alt: "Chat del vínculo con Víctor: Venus y Marte en el encabezado, y la respuesta sobre la energía de la relación." },
  { id: "gal-nucleo", src: nucleo, alt: "El núcleo de la identidad en el informe." },
  { id: "gal-amor-menu", src: amorMenu, alt: "Apartados del informe Yo en el amor." },
  { id: "gal-dinamicas", src: dinamicas, alt: "Dinámicas internas y reacciones en el informe de identidad." },
  { id: "gal-sol-lectura", src: solLectura, alt: "Lectura completa del Sol en Cáncer." },
];
