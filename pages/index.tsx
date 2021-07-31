import { useEffect } from 'react';
import { useAtom } from 'jotai';
import Head from 'next/head';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Flex, useToast } from '@chakra-ui/react';
import { WithPrivateRoute } from '../components/WithPrivateRoute';
import { Layout } from '../components/Layout';
import { SiteItem } from '../components/SiteItem';
import { CreateSiteModal } from '../components/CreateSiteModal';
import { auth } from '../lib/nhost';
import { siteAtom } from '../lib/jotai';
import type {
  SiteType,
  SitesAggregateData,
  SiteInsertedData,
  SiteDeletedData,
} from '../lib/types';

export const SITES_AGGREGATE = gql`
  query SITES_AGGREGATE($userId: uuid!) {
    sites_aggregate(
      limit: 10,
      offset: 0,
      where: {user: {id: {_eq: $userId}}}
    ) {
      nodes {
        description
        id
        name
        slug
        status
        user {
          id
        }
      }
    }
  }
`;

export const INSERT_SITE_ONE = gql`
  mutation INSERT_SITE_ONE($object: sites_insert_input!) {
    insert_sites_one(object: $object) {
      created_at
      updated_at
      id
      description
      name
      slug
      user_id
      status
    }
  }
`;

export const DELETE_SITE_BY_PK = gql`
  mutation DELETE_SITE_BY_PK($id: uuid!) {
    delete_sites_by_pk(id: $id) {
      id
      name
    }
  }
`;

function Home() {
  const toast = useToast();
  const [site, setSite] = useAtom(siteAtom);

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
    refetch: queryRefetch,
  } = useQuery<SitesAggregateData>(
    SITES_AGGREGATE,
    {
      variables: {
        userId: auth.getClaim('x-hasura-user-id'),
      },
      context: {
        headers: {
          'x-hasura-role': 'me',
        },
      },
    },
  );

  const [
    insertSite,
    {
      data: insertData,
      loading: insertLoading,
      // error: insertError,
    },
  ] = useMutation<SiteInsertedData>(INSERT_SITE_ONE);

  const [
    deleteSite,
    {
      data: deleteData,
      loading: deleteLoading,
      // error: deleteError,
    },
  ] = useMutation<SiteDeletedData>(DELETE_SITE_BY_PK);

  const sites = queryData?.sites_aggregate?.nodes?.filter((s) => !!s);

  const handleSubmit = async (input: Partial<SiteType>) => {
    await insertSite({
      variables: { object: input },
      context: {
        headers: {
          'x-hasura-role': 'me',
        },
      },
    });
  };

  const handleDelete = async (id: string) => {
    await deleteSite({
      variables: { id },
      context: {
        headers: {
          'x-hasura-role': 'me',
        },
      },
    });
  };

  useEffect(() => {
    if (site) {
      setSite(null);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (insertData) {
      queryRefetch();
      toast({
        title: `Created ${insertData.insert_sites_one.name} successful`,
        position: 'top',
        status: 'success',
        isClosable: true,
        duration: 1000,
      });
    }
  }, [insertData, toast, queryRefetch]);

  useEffect(() => {
    if (deleteData) {
      queryRefetch();
      toast({
        title: `Deleted site: ${deleteData.delete_sites_by_pk.name} successful`,
        position: 'top',
        status: 'warning',
        isClosable: true,
        duration: 3000,
      });
    }
  }, [deleteData, toast, queryRefetch]);

  if (queryLoading && !queryData) {
    return <div>Loading...</div>;
  }

  if (queryError || !sites) {
    console.error(queryError); // eslint-disable-line
    return <div>Error getting sites data</div>;
  }

  return (
    <>
      <Head>
        <title>Gallery</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Flex direction="column" width="100%" padding="20px">
          <CreateSiteModal
            loading={insertLoading || deleteLoading}
            onSubmit={handleSubmit}
          />

          {sites.map((s) => (
            <SiteItem
              key={s.id}
              name={s.name}
              path={`/dashboard?site=${s.id}&tab=pages`}
              onClick={() => setSite(s)}
              onDelete={() => handleDelete(s.id)}
            />
          ))}
        </Flex>
      </Layout>
    </>
  );
}

export default WithPrivateRoute(Home);
