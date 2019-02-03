const frag = gql`
  query otherQuery {
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
