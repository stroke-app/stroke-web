import { createFileRoute, Link } from "@tanstack/react-router";

import { DocsNav, NextLinks, PageBody, PageHeader, PageShell, SideNav } from "#/components/page";
import { ODBC_ENGINES } from "#/lib/engines";
import { seo } from "#/lib/seo";

export const Route = createFileRoute("/docs/odbc")({
  head: () =>
    seo({
      title: "ODBC databases · Stroke docs",
      description:
        "Connect the Stroke database client to IBM Db2, SAP HANA, Teradata, Vertica, Databricks, Hive, Trino and any other database with an ODBC driver: install the driver, pick a preset or a data source, and browse.",
      path: "/docs/odbc",
      breadcrumbs: [
        { name: "Docs", path: "/docs" },
        { name: "ODBC databases", path: "/docs/odbc" },
      ],
    }),
  component: OdbcPage,
});

function slug(title: string) {
  return title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

const SECTIONS = [
  "How it works",
  "Install the driver",
  "Connect",
  "What works",
  "When it doesn't connect",
];

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={slug(title)}
      className="scroll-mt-24 border-t border-border pt-10 first:border-t-0 first:pt-0"
    >
      <p className="font-mono text-[12px] text-faint tabular-nums">{number}</p>
      <h2 className="mt-2 text-[1.75rem]">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-[1.7] text-pretty text-soft [&_:not(pre)>code]:rounded-[5px] [&_:not(pre)>code]:border [&_:not(pre)>code]:border-ink/[0.07] [&_:not(pre)>code]:bg-ink/[0.045] [&_:not(pre)>code]:px-[0.35em] [&_:not(pre)>code]:py-px [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.84em] [&_:not(pre)>code]:text-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-ink/25 [&_a]:underline-offset-[3px] [&_a]:transition-colors [&_a:hover]:decoration-ink/70 [&_li]:ms-5 [&_li]:list-disc [&_strong]:font-[560] [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

const EXAMPLE =
  "Driver={IBM DB2 ODBC DRIVER};Hostname=db2.example.com;Port=50000;Database=SAMPLE;Protocol=TCPIP;";

function OdbcPage() {
  const presets = ODBC_ENGINES.filter((e) => e.slug !== "odbc");
  return (
    <PageShell>
      <PageHeader
        align="start"
        eyebrow="Docs"
        title="ODBC databases"
        description="Stroke reaches any database with an ODBC driver: install the vendor's driver, pick its preset, and the database opens like any other. The ODBC bridge is in beta."
      />
      <PageBody
        aside={
          <div className="space-y-10">
            <DocsNav />
            <SideNav
              title="On this page"
              items={SECTIONS.map((t) => ({ label: t, hash: slug(t) }))}
            />
          </div>
        }
      >
        <div className="max-w-[42rem] space-y-10">
          <Section number="01" title="How it works">
            <p>
              An ODBC connection has two parts: a <strong>driver manager</strong>, which finds and
              loads drivers, and the database's own <strong>driver</strong>, which talks to it.
              Stroke ships the driver manager (unixODBC on macOS and Linux, the system's on
              Windows), so the only thing to install is the driver for the database you use.
            </p>
            <p>
              Stroke reads the drivers and data sources already registered on your computer: in{" "}
              <code>/etc/odbcinst.ini</code> and <code>~/.odbc.ini</code> on Linux, Homebrew's and{" "}
              <code>/Library/ODBC</code> on macOS, and the ODBC Data Source Administrator on
              Windows.
            </p>
          </Section>

          <Section number="02" title="Install the driver">
            <p>Every preset links to its driver from the connection form. They come from:</p>
            <ul className="space-y-1.5">
              {presets.map((e) => (
                <li key={e.slug}>
                  <Link to="/databases/$engine" params={{ engine: e.slug }}>
                    {e.name}
                  </Link>
                  : {e.connect[0].replace(/^Install /, "")}
                </li>
              ))}
            </ul>
            <p>
              Install the build for your computer: an Apple silicon Mac needs an arm64 or universal
              driver, and Windows a 64-bit one. Driver installers register themselves; on Linux the
              distribution's package or the vendor's instructions add the driver to{" "}
              <code>odbcinst.ini</code>. Stroke picks up a new driver the next time you choose a
              preset, no restart needed.
            </p>
          </Section>

          <Section number="03" title="Connect">
            <p>
              Choose <strong>New connection</strong>, then the engine under{" "}
              <strong>Through ODBC</strong>, or plain <strong>ODBC</strong> for anything else. There
              are three ways in:
            </p>
            <ul className="space-y-1.5">
              <li>
                <strong>Fields</strong>: the preset picks the installed driver and asks only for
                what its database needs. The connection string it builds shows below the fields,
                with Edit as text to take it over.
              </li>
              <li>
                <strong>Data source</strong>: any DSN set up in <code>odbc.ini</code> or the ODBC
                Data Source Administrator.
              </li>
              <li>
                <strong>Connection string</strong>: whatever the driver accepts, for example{" "}
                <code>
                  {EXAMPLE.split(";")
                    .filter(Boolean)
                    .map((part) => (
                      <span key={part}>
                        {part};<wbr />
                      </span>
                    ))}
                </code>
              </li>
            </ul>
            <p>
              The user name and password fields are added as <code>UID</code> and <code>PWD</code>{" "}
              when the string has none. Passwords, and a pasted connection string that may hold one,
              are kept in your OS keychain. <strong>Test</strong> shows what the driver reports the
              database to be.
            </p>
          </Section>

          <Section number="04" title="What works">
            <ul className="space-y-1.5">
              <li>
                Schemas (or catalogs), tables and views, with columns, primary and foreign keys
              </li>
              <li>
                Paging that follows the database: LIMIT and OFFSET, OFFSET and FETCH, SKIP and
                FIRST, or TOP
              </li>
              <li>Filter, search, sort, and edit, insert or delete rows by primary key</li>
              <li>
                The SQL editor, with results streamed as they arrive and a Stop that cancels the
                statement on the server
              </li>
              <li>Agents over MCP, at the access level you set</li>
            </ul>
            <p>
              Not yet: backup and import, explicit transactions, and query plans (run the database's
              own EXPLAIN in the editor). Each preset follows its vendor's driver documentation and
              is marked beta until it has been run against the real database.
            </p>
          </Section>

          <Section number="05" title="When it doesn't connect">
            <ul className="space-y-1.5">
              <li>
                <strong>No driver is registered</strong>: the driver is not installed, or not where
                Stroke looks. On Linux, check that <code>odbcinst -q -d</code> lists it.
              </li>
              <li>
                <strong>Can't open lib</strong>: the registry names a driver file that is missing or
                built for another architecture. Point its <code>Driver</code> line at the full path
                of the library.
              </li>
              <li>
                <strong>Data source name not found</strong>: the DSN is not in{" "}
                <code>~/.odbc.ini</code>, <code>/etc/odbc.ini</code> or, on Windows, the 64-bit ODBC
                Data Source Administrator.
              </li>
              <li>
                Anything else comes from the driver itself and appears as it wrote it; its vendor's
                documentation explains the codes.
              </li>
            </ul>
          </Section>
        </div>

        <div className="max-w-[42rem]">
          <NextLinks>
            <Link to="/docs">← Getting started</Link>
            <Link to="/databases">All databases →</Link>
            <Link to="/download">Download →</Link>
          </NextLinks>
        </div>
      </PageBody>
    </PageShell>
  );
}
