import React from 'react';
import {HomeIcon} from "@heroicons/react/24/outline";

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
    <ul className={'mb-6 flex items-center'}>
      { links?.map((link) => (
        <li key={`${link?.id}`} className={'mr-4 py-4'}>
          <button className={`bg-white text-black ${focusedNode === link.id && 'font-bold'}`} onClick={() => onClick(link?.id)}>
            {link.id === 'root' ? (
              <HomeIcon className={'w-4 h-4 text-slate-800'}/>
            ) : (
              <span>{link?.value}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default BreadcrumbTrail;