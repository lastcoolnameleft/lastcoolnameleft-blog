const measurementMeta = document.querySelector(
  'meta[name="ga-measurement-id"]',
) as HTMLMetaElement | null;

const measurementId = measurementMeta?.content?.trim();

if (!measurementId) {
  // Do nothing when analytics is not configured.
} else {
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    measurementId,
  )}`;
  document.head.appendChild(gtagScript);

  const w = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  w.dataLayer = w.dataLayer ?? [];

  const gtag = (...args: unknown[]) => {
    w.dataLayer?.push(args);
  };

  w.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, {
    anonymize_ip: true,
  });
}
