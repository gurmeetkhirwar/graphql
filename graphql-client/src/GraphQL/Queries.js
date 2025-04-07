import { gql } from '@apollo/client';

export const GET_GAMES = gql`
  query Games {
    games {
        id,
        title,
        platform,
        reviews {
        id,
        rating,
        author {
            id,
            name
        }
        }
    }
  }
`;