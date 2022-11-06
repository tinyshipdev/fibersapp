import React from 'react';
import parseMarkdown from '../lib/markdown-parser';
import {HomeIcon} from "@heroicons/react/24/outline";

interface BreadcrumbTrailProps {
  zoomedNode: string,
  links: { id: string, value: string }[]
  onClick: (id: string) => void;
}

const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  zoomedNode,
  links,
  onClick
}) => {
  return (
    <ul className={'flex items-center'}>
      { links?.map((link) => (
        <li key={`${link?.id}`} className={'mr-4 py-4'}>
          <button onClick={() => onClick(link?.id)} disabled={zoomedNode === 'root'}>
            {link.id === 'root' ? (
              <HomeIcon className={'w-4 h-4 text-slate-400'}/>
            ) : (
              <div
                className={`${zoomedNode === link.id ? 'text-slate-600 font-bold': 'text-slate-400'}`}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(link?.value)}}
              />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default BreadcrumbTrail;