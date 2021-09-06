import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { GridItem, MainTemplate, MenuTemplate } from '@/components';
import { GET_EVERYTHING_BY_SITE_SLUG } from '@/lib/graphqls';
import { DEFAULT_LAYOUT, ROW_HEIGHT } from '@/lib/constants';
import { useGenerateDom } from '@/lib/hooks';
import { childrenHeightAtom } from '@/lib/jotai';
import { OptionKey, SectionElement } from '@/lib/enums';
import type { OptionValue, SiteType } from '@/lib/types';

const ResponsiveLayout = WidthProvider(Responsive);

export const SingleSiteView = () => {
  const [childrenHeight] = useAtom(childrenHeightAtom);
  console.log('### childrenHeight: ', childrenHeight);
  const router = useRouter();
  const { slugs } = router.query;

  const { siteSlug, pageSlug } = useMemo(() => {
    if (slugs && Array.isArray(slugs)) {
      const siteParam = slugs[0];
      const pageParam = slugs[slugs.length - 1];
      return {
        siteSlug: siteParam,
        pageSlug: pageParam !== siteParam ? pageParam : '',
      };
    }
    return {
      siteSlug: '',
      pageSlug: '',
    };
  }, [slugs]);

  const { loading, error, data } = useQuery(GET_EVERYTHING_BY_SITE_SLUG, {
    variables: { slug: siteSlug },
  });

  const site: NonNullable<SiteType> = data?.sites_aggregate?.nodes[0] ?? {};
  const { layouts, options, pages } = site;

  let currentLayouts = layouts ? layouts[0] : undefined;
  const currentMenuData = options?.find(({ key }) => key === OptionKey.Menu);

  // TODO: Make the layouts based on the childrenHeight
  // if (currentLayouts) {
  //   const grids = currentLayouts.value;
  //   Object.keys(grids).forEach((k: string) => {
  //     const main = grids[k].find((o) => o.i === 'MAIN');
  //     if (main) {
  //       currentLayouts = {
  //         ...currentLayouts,
  //         value: {
  //           ...currentLayouts.value,
  //         },
  //       };
  //     }
  //   });
  // }

  const handleSelect = (items: OptionValue[]) => {
    const pagePath = items.reduce((acc, current) => {
      const { slug } = current;
      const { is_home: isHome } = pages?.find((o) => o.slug === slug) ?? {};
      return acc.concat('/', `${isHome ? '' : slug}`.toLowerCase());
    }, siteSlug);

    router.push(`/sites/${pagePath}`, undefined, {
      shallow: true,
    });
  };

  const currentPage = useMemo(() => {
    if (pageSlug) {
      return pages?.find((o) => o.slug === pageSlug);
    }
    return pages?.find((o) => !!o.is_home);
  }, [pageSlug, pages]);

  const componentSwitcher = (key: SectionElement) => {
    switch (key) {
    case SectionElement.Menu:
      return (
        <MenuTemplate
          menu={currentMenuData?.value as OptionValue[] ?? []}
          onSelect={handleSelect}
        />
      );
    case SectionElement.Main:
      return <MainTemplate page={currentPage} />;
    default:
      return <>{key.toUpperCase()}</>;
    }
  };

  const elements = useGenerateDom({
    component: ({ key }) => componentSwitcher(key),
  });

  if (loading && !data && currentLayouts) {
    return <div>Loading...</div>;
  }

  if (error || !site) {
    console.warn(error); // eslint-disable-line
    return <div>Error getting site data</div>;
  }

  return (
    <Box maxWidth="1400px" marginX="auto">
      <ResponsiveLayout
        layouts={currentLayouts?.value}
        breakpoints={DEFAULT_LAYOUT.breakpoints}
        cols={DEFAULT_LAYOUT.cols}
        rowHeight={ROW_HEIGHT}
        isDraggable={false}
        isResizable={false}
      >
        {elements.map(({ id, component }) => (
          <GridItem key={id} editable>
            {component}
          </GridItem>
        ))}
      </ResponsiveLayout>
    </Box>
  );
};

export default SingleSiteView;
