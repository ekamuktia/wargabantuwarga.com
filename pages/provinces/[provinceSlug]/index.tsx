/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ContactList } from "../../../components/contact-list";
import { BackButton } from "../../../components/layout/back-button";
import { Page } from "../../../components/layout/page";
import { PageContent } from "../../../components/layout/page-content";
import { PageHeader } from "../../../components/layout/page-header";
import { SearchForm } from "../../../components/search-form";
import { useSearch } from "../../../lib/hooks/use-search";
import provinces, { Contact, getProvincesPaths } from "../../../lib/provinces";
import { getTheLastSegmentFromKebabCase } from "../../../lib/string-utils";

import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

type ProvinceProps = {
  provinceName: string;
  provinceSlug: string;
  contactList: Contact[];
};

export default function ProvincePage(props: ProvinceProps) {
  const { provinceName, provinceSlug, contactList } = props;
  const router = useRouter();
  const [filteredContacts, handleSubmitKeywords, urlParams, filterItems] =
    useSearch(
      contactList,
      [
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
      [
        { field: "kebutuhan", title: "Kategori" },
        { field: "lokasi", title: "Lokasi" },
      ],
      {
        penyedia_asc: {
          field: "penyedia",
          order: "asc",
        },
        /*
        verified_first: {
          field: ["verifikasi", "penyedia"],
          order: ["desc", "asc"],
        },*/
        verified_first: {
          field: "verifikasi",
          order: "desc",
        },
      },
      "verified_first",
    );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (provinceName) {
    return (
      <Page>
        <PageHeader
          backButton={<BackButton href="/provinces" />}
          breadcrumbs={[
            {
              name: "Provinsi",
              href: "/provinces",
            },
            {
              name: provinceName,
              href: `/provinces/${router.query.provinceSlug}`,
              current: true,
            },
          ]}
          title={provinceName}
        />
        <PageContent>
          <SearchForm
            checkDocSize={true}
            filterItems={filterItems}
            initialValue={urlParams}
            itemName="kontak"
            onSubmitKeywords={handleSubmitKeywords}
            sortSettings={[
              { value: "verified_first", label: "Terverifikasi" },
              { value: "penyedia_asc", label: "Nama" },
            ]}
          />
          <ContactList data={filteredContacts} provinceSlug={provinceSlug} />
        </PageContent>
      </Page>
    );
  } else {
    return (
      <Page>
        <h1>Database not found</h1>
      </Page>
    );
  }
}

export const getStaticPaths: GetStaticPaths = () => {
  const paths = getProvincesPaths();

  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps = ({ params = {} }) => {
  const { provinceSlug } = params;
  const index = getTheLastSegmentFromKebabCase(provinceSlug as string);
  const province = index ? provinces[index as unknown as number] : null;
  const provinceName = province ? province.name : "";
  const contactList = province
    ? [...province.data].sort(
        (a, b) =>
          b.verifikasi - a.verifikasi ||
          (a.penyedia ?? "").localeCompare(b.penyedia ?? ""),
      )
    : null;

  return {
    props: {
      provinceName,
      provinceSlug,
      contactList,
    },
  };
};
