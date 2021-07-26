import "~/styles/globals.css";
import "nprogress/nprogress.css";

import "typeface-inter";

import { useEffect } from "react";

import { LayoutRoot } from "~/components/layout/layout-root";
import config from "~/lib/config";
import { initializeGTM } from "~/lib/gtm";

import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { DefaultSeo } from "next-seo";
import NProgress from "nprogress";

const meta = {
  siteName: config.site_name,
  title: `${config.site_tagline} | ${config.site_name}`,
  tagline: config.site_tagline,
  description: config.site_description,
  url: config.site_url,
};

export default function App({ Component, pageProps, router }: AppProps) {
  useEffect(() => {
    const handleStart = (_: string, { shallow }: { shallow: boolean }) => {
      if (!shallow) {
        NProgress.start();
      }
    };
    const handleStop = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  useEffect(initializeGTM, []);

  return (
    <LayoutRoot>
      <DefaultSeo
        canonical={`${meta.url}${router.asPath || "/"}`}
        description={meta.description}
        openGraph={{
          type: "website",
          locale: "id_ID",
          title: meta.title,
          description: meta.description,
          site_name: meta.siteName,
          images: [
            {
              url: "https://wargabantuwarga.com/wbw_og.png",
              alt: meta.siteName,
              height: 640,
              width: 1427,
            },
          ],
        }}
        title={config.site_tagline}
        titleTemplate={`%s | ${meta.siteName}`}
        twitter={{
          handle: "@KawalCOVID19",
          site: "@KawalCOVID19",
          cardType: "summary_large_image",
        }}
      />
      <Head>
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <meta
          content="0Ierdm0GW-vFOuFxO5TbsI-wCMFVL5FLRQmDtn4XjjA"
          name="google-site-verification"
        />

        <link href="/favicon.ico" rel="icon" />
        <link href="/manifest.json" rel="manifest" />
        <meta content="#1667C2" name="theme-color" />
      </Head>

      <Script src="https://www.googletagmanager.com/gtm.js?id=GTM-5X4ZPBX" />

      <Component {...pageProps} />
    </LayoutRoot>
  );
}
