import { FunctionComponent } from 'react';
import { ReactComponent as SolidProofLogo } from 'src/assets/solid-proof.svg';

const auditList = [
  {
    name: 'SolidProof',
    url: 'https://github.com/solidproof/projects/blob/main/2023/Sifi/SmartContract_Audit_Solidproof_Sifi.pdf',
    Icon: SolidProofLogo,
  },
];

const Audits: FunctionComponent = () => {
  return (
    <section className="mx-auto w-full max-w-5xl pt-10">
      <h3 className="font-display text-center text-2xl mb-5 sm:text-2xl">Audited By</h3>
      <div className="grid gap-6">
        {auditList.map(({ Icon, name, url }, index) => (
          <div
            key={name}
            className={`w-full justify-center ${index > 2 ? 'hidden sm:flex' : 'flex'}`}
          >
            <a className="block" target="_blank" rel="noopener noreferrer" href={url.toString()}>
              <Icon className="dark:text-flashbang-white text-new-black h-9 max-w-full" />
              <span className="sr-only">{name}</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export { Audits };
