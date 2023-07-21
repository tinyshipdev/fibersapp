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
    <ul className={'flex items-center gap-8'}>
      { links?.map((link) => (
        <li key={`${link?.id}`}>
          <button onClick={() => onClick(link?.id)} disabled={zoomedNode === 'root'} className='flex items-center'>
            {link.id === 'root' ? (
              <HomeIcon className={`w-4 h-4 ${zoomedNode === link.id ? 'text-slate-500': 'text-slate-300'}`}/>
            ) : (
              <span
                className={`${zoomedNode === link.id ? 'text-slate-500': 'text-slate-300'} text-sm inline`}
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