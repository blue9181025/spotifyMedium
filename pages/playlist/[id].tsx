import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import GradientPage from '~/components/GradientPage'
import { prismaClient } from '~/lib/prisma'
import { Playlist, Song } from '@prisma/client'
import { validateToken } from '~/helpers/auth'
import { AUTH_JWT_COOKIE_NAME } from '~/constants/auth'
import PlayerButton from '~/components/PlayerButton'
import { Box } from '@chakra-ui/layout'
import SongsTable from '~/components/SongsTable'

interface PlaylistPageProps {
  playlist: Playlist & {songs: (Song & {artist: {id: number, name: string}})[]}
}

const PlaylistPage = ({ playlist }: PlaylistPageProps) => {
  return (
    <>
      <Head>
        <title>
          {`Sbotify - ${playlist.name}`}
        </title>
      </Head>
      <GradientPage
        title={playlist.name}
        subtitle={'Playlist'}
        description={playlist.description}
        stats={[`${playlist.songs.length} songs`]}
        headerGradient={{
          start: '#B7351B',
          end: '#3E140E',
        }}
        contentGradient={{
          start: '#48140B',
        }}
        avatarSrc={playlist.avatar}
        isAvatarSquare
      >
        <PlayerButton />
        <Box
          sx={{
            marginTop: '20px',
          }}
        >
          <SongsTable songs={playlist.songs} />
        </Box>
      </GradientPage>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
  const { id: userId } = validateToken(req.cookies[AUTH_JWT_COOKIE_NAME])
  const playlist = await prismaClient.playlist.findFirst({
    where: {
      id: +(query.id ?? ''),
      userId,
    },
    include: {
      songs: {
        include: {
          artist: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  return {
    props: {
      playlist,
    },
  }
}

export default PlaylistPage
