import React from 'react';
import { APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK, ROW_BETWEEN, TITLE_H1 } from '../ui/styles';

type Props = {
  title?: string;
  metaDescription?: string;
  headerSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  children: React.ReactNode;
};

export default function PageBase({ title, metaDescription, headerSlot, actionsSlot, children }: Props) {
  React.useEffect(() => {
    if (title) document.title = `LensFinder – ${title}`;
    if (metaDescription) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag); }
      tag.setAttribute('content', metaDescription);
    }
  }, [title, metaDescription]);

  return (
    <main className={APP_BACKGROUND}>
      <a href="#content" className="sr-only focus:not-sr-only">Skip to content</a>
      <div className={PAGE_CONTAINER}>
        {(headerSlot || title || actionsSlot) && (
          <header className={`${ROW_BETWEEN} mb-4`}>
            <div>
              {title && <h1 className={TITLE_H1}>{title}</h1>}
              {headerSlot}
            </div>
            {actionsSlot}
          </header>
        )}
        <div id="content" className={SECTION_STACK}>
          {children}
        </div>
      </div>
    </main>
  );
}


