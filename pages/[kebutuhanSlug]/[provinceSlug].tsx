import { ContactList } from "~/components/contact-list";
import { BackButton } from "~/components/layout/back-button";
import { Page } from "~/components/layout/page";
import { PageContent } from "~/components/layout/page-content";
import { PageHeader } from "~/components/layout/page-header";
import { SearchForm } from "~/components/search-form";
import { useSearch } from "~/lib/hooks/use-search";
import provinces, { Contact } from "~/lib/provinces";
import { getKebabCase } from "~/lib/string-utils";

import { GetStaticPaths, GetStaticProps } from "next";

type KebutuhanProvinceProps = {
  kebutuhan: string;
  kebutuhanSlug: string;
  provinceName: string;
  provinceSlug: string;
  contactList: Contact[];
};

export default function KebutuhanProvincePage(props: KebutuhanProvinceProps) {
  const { kebutuhan, kebutuhanSlug, provinceName, provinceSlug, contactList } =
    props;
  const [
    filteredContacts,
    handleSubmitKeywords,
    urlParams,
    filterItems,
    isLoading,
  ] = useSearch({
    items: contactList,
    fieldNames: [
      "kebutuhan",
      "penyedia",
      "lokasi",
      "alamat",
      "keterangan",
      "kontak",
      "link",
      "tambahan_informasi",
      "bentuk_verifikasi",
    ],
    aggregationSettings: [{ field: "lokasi", title: "Lokasi" }],
    sortSettings: {
      verified_first: {
        field: ["verifikasi", "penyedia"],
        order: ["desc", "asc"],
      },
    },
    defaultSort: "verified_first",
  });

  return (
    <Page>
      <PageHeader
        backButton={<BackButton href={`/${kebutuhanSlug}`} />}
        breadcrumbs={[
          {
            name: kebutuhan,
            href: `/${kebutuhanSlug}`,
          },
          {
            name: provinceName,
            href: `/${kebutuhanSlug}/${provinceSlug}`,
            current: true,
          },
        ]}
        title={`${kebutuhan} di ${provinceName}`}
      />
      <PageContent>
        <SearchForm
          checkDocSize={true}
          filterItems={filterItems}
          initialValue={urlParams}
          isLoading={isLoading}
          itemName="kontak"
          onSubmitKeywords={handleSubmitKeywords}
          placeholderText="Cari berdasarkan kontak, alamat, provider, dan keterangan"
        />
        <ContactList
          data={filteredContacts}
          isLoading={isLoading}
          provinceName={provinceName}
          provinceSlug={provinceSlug}
        />
      </PageContent>
    </Page>
  );
}

const kebutuhanList = ["Donor plasma", "Oksigen"];

export const getStaticPaths: GetStaticPaths = () => {
  const paths: {
    params: {
      kebutuhanSlug: string;
      provinceSlug: string;
    };
  }[] = [];
  kebutuhanList.forEach((kebutuhan) => {
    provinces.forEach((province) => {
      const provinceSlug = province.slug;
      paths.push({
        params: { kebutuhanSlug: getKebabCase(kebutuhan), provinceSlug },
      });
    });
  });

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps = ({ params = {} }) => {
  const { kebutuhanSlug, provinceSlug } = params;
  const kebutuhan = kebutuhanList.find(
    (cur) => getKebabCase(cur) == kebutuhanSlug,
  );
  const province = provinces.find((prov) => prov.slug === provinceSlug);
  const provinceName = province ? province.name : "";
  const contactList = province
    ? [...province.data]
        .filter((cur) => cur.kebutuhan == kebutuhan)
        .sort((a, b) => {
          return (
            b.verifikasi - a.verifikasi ||
            (a.penyedia ?? "").localeCompare(b.penyedia ?? "")
          );
        })
    : null;
  return {
    props: {
      kebutuhan,
      kebutuhanSlug,
      provinceName,
      provinceSlug,
      contactList,
    },
  };
};
