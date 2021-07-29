/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

interface ContactProvince extends Contact {
  provinsi: string;
}

type KebutuhanProps = {
  kebutuhan: string;
  kebutuhanSlug: string;
  contactList: ContactProvince[];
};

export default function KebutuhanPage(props: KebutuhanProps) {
  const { kebutuhan, kebutuhanSlug, contactList } = props;
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
    aggregationSettings: [{ field: "provinsi", title: "Provinsi" }],
    sortSettings: {
      verified_first: {
        field: ["verifikasi", "penyedia"],
        order: ["desc", "asc"],
      },
    },
    defaultSort: "verified_first",
    routeParam: true,
  });

  return (
    <Page>
      <PageHeader
        backButton={<BackButton href="/" />}
        breadcrumbs={[
          {
            name: kebutuhan,
            href: `/${kebutuhanSlug}`,
            current: true,
          },
        ]}
        title={kebutuhan}
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
          provinceName={kebutuhan}
          provinceSlug={kebutuhanSlug}
        />
      </PageContent>
    </Page>
  );
}

const kebutuhanList = ["Donor plasma", "Oksigen"];

export const getStaticPaths: GetStaticPaths = () => {
  const paths = kebutuhanList.map((kebutuhan) => {
    const kebutuhanSlug = getKebabCase(kebutuhan);

    return {
      params: { kebutuhanSlug },
    };
  });

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps = ({ params = {} }) => {
  const { kebutuhanSlug } = params;
  const kebutuhan = kebutuhanList.find(
    (cur) => getKebabCase(cur) == kebutuhanSlug,
  );
  let contactList: ContactProvince[] = [];
  if (kebutuhan) {
    contactList = provinces
      .reduce((acc: ContactProvince[], province) => {
        province.data.forEach((cur) => {
          if (cur.kebutuhan == kebutuhan) {
            acc.push({ ...cur, provinsi: province.name } as ContactProvince);
          }
        });
        return acc;
      }, [])
      .sort((a, b) => {
        return (
          b.verifikasi - a.verifikasi ||
          (a.penyedia ?? "").localeCompare(b.penyedia ?? "")
        );
      });
  }

  return {
    props: {
      kebutuhan,
      kebutuhanSlug,
      contactList,
    },
  };
};
