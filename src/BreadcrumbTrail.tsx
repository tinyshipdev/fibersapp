import React from 'react';

interface BreadcrumbTrailProps {
  focusedNode: string,
  links: { id: string, value: string }[]
  onClick: (id: string) => void;
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  focusedNode,
  links,
  onClick
}) => {
  return (
    <ul className={'mb-6 flex'}>
      { links?.map((link) => (
        <li key={`${link?.id}`} className={'mr-4'}>
          <button className={`bg-white text-black p-2 py-1 ${focusedNode === link.id && 'font-bold'}`} onClick={() => onClick(link?.id)}>{link?.value}</button> |
        </li>
      ))}
    </ul>
  );
};

export default BreadcrumbTrail;