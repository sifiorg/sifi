import { FunctionComponent } from 'react';
import { Accordion } from '@sifi/shared-ui';
import layersIcon from 'src/assets/layers.svg';
import linkIcon from 'src/assets/link.svg';

const items = {
  exchange: [
    {
      title: 'What is SideShift.fi?',
      body: 'SideShift.fi is a DEX aggregator that finds the best price for your on-chain cryptocurrency trades.',
    },
    {
      title: 'How does SideShift.fi offer the best rates?',
      body: 'When a trade is initiated, SideShift.fi sources prices from multiple DEXes and offers you the best rate we can find.',
    },
  ],
  feesAndSupportedChains: [
    {
      title: 'Which blockchains do you support?',
      body: 'We currently support trading on Ethereum but expect to add more blockchains in the near future.',
    },
    {
      title: 'What fees do you take?',
      body: 'We charge 0.02% in fees on the token you are transferring from.',
    },
  ],
};

const FAQ: FunctionComponent = () => {
  return (
    <section id="faq">
      <div className="mx-auto w-full max-w-7xl py-16 px-4 sm:px-0">
        <h2 className="dark:text-flashbang-white font-display mb-6 text-left text-2xl sm:text-3xl md:text-[2.5rem] md:leading-[3rem]">
          Frequently Asked <br /> Questions
        </h2>
        <Accordion icon={layersIcon} title="SideShift.fi Exchange" items={items.exchange} />
        <Accordion
          icon={linkIcon}
          title="Fees & Supported Chains"
          items={items.feesAndSupportedChains}
        />
      </div>
    </section>
  );
};

export { FAQ };
