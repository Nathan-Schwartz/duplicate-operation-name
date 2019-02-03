const frag = gql`
  query tsOtherQuery {
    person {
      firstName
      lastName
    }
  }
`;

const query = gql`
  query {
    author {
      firstName
      lastName
    }
  }
`;
