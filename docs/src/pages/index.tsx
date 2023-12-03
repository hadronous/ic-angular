import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>

        <p className="hero__subtitle">{siteConfig.tagline}</p>

        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/guides/configuring-angular-cli"
          >
            Getting started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />

      <main className="padding-vert--xl">
        <div className="container">
          <div className="row">
            <div className="col">
              <h3>The Internet Computer</h3>

              <p>
                The{' '}
                <a href="https://internetcomputer.org/" target="_blank">
                  Internet Computer
                </a>{' '}
                is a public compute network that provides an autonomous and
                tamperproof environment for running serverless code.
              </p>
            </div>

            <div className="col">
              <h3>Canisters</h3>

              <p>
                Bundles of serverless code running on the Internet Computer are
                called{' '}
                <a
                  href="https://internetcomputer.org/how-it-works/canister-lifecycle/"
                  target="_blank"
                >
                  <i>canisters</i>
                </a>
                . Canisters can be written in any language that compiles to
                WebAssembly (WASM), run arbitrary computations and even serve
                web assets.
              </p>
            </div>

            <div className="col">
              <h3>Angular</h3>

              <p>
                That's where{' '}
                <a href="https://angular.dev/" target="_blank">
                  Angular
                </a>{' '}
                comes in. Angular is a web development framework for building
                modern apps. It works at any scale and use by many millions of
                developers all over the world.
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <h2 className="text--center margin-vert--lg">
                Other projects by Hadronous Labs
              </h2>

              <p className="text--center">
                <a href="https://hadronous.github.io/pic-js" target="_blank">
                  Pic JS
                </a>{' '}
                is a TypeScript/JavaScript canister testing library for the
                Internet Computer.
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
