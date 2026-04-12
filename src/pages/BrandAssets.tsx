const WEGO_IMAGES = [
  "AF_BRANDING_WEGO_images-000.jpg",
  "logo-clean.png",
  "portable.jpg",
  "voiture.jpg",
  "voiture2.jpg",
  "sac2.jpg",
  "sac3.jpg",
  "sacs.jpg",
  "Promotions vibrantes pour l'application Wego.png",
  "Services de l'app _We_ en action.png",
  "Voyage, santé et shopping avec We.png",
] as const;

const BrandAssets = () => {
  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-8">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo/wego_logo.svg"
            alt="Wego"
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Brand assets</h1>
            <p className="text-sm text-muted-foreground">
              Dossier: <span className="font-mono">public/images/wego</span>
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WEGO_IMAGES.map((filename) => {
            const src = encodeURI(`/images/wego/${filename}`);
            return (
              <figure key={filename} className="glass overflow-hidden rounded-2xl">
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted/20">
                  <img
                    src={src}
                    alt={filename}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="truncate text-xs text-muted-foreground">
                    {filename}
                  </span>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-foreground/80">
                    {src}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrandAssets;
