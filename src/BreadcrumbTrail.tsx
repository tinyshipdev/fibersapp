import React from 'react';

const links = [
  { id: 'root', value: 'root' }
]

interface BreadcrumbTrailProps {
  onClick: (id: string) => void;
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  onClick
}) => {
  return (
    <ul className={'mb-6 bg-slate-500 p-4'}>
      { links?.map((link) => (
        <li key={link?.id}>
          <button className={'bg-white text-black'} onClick={() => onClick(link?.id)}>{link?.value}</button>
        </li>
      ))}
    </ul>
  );
};

export default BreadcrumbTrail;