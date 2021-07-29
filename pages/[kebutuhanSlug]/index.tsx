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

type KebutuhanProps = {
  kebutuhan: string;
  kebutuhanSlug: string;
  contactList: Contact[];
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
        backButton={<BackButton href="/provinces" />}
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

const kebutuhanList = ["Donor Plasma", "Oksigen"];

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
  let contactList: Contact[] = [];
  if (kebutuhan) {
    contactList = provinces
      .reduce((acc: Contact[], province) => {
        const filtered = province.data.filter(
          (cur) => cur.kebutuhan == kebutuhan,
        );
        return acc.concat(filtered);
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
