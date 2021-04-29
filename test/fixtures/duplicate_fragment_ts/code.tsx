const frag = gql`
  fragment tsdetails on Author {
    firstName
    lastName
  }
`;

const query = gql`
  query {
    author {
      ...tsdetails
    }
  }

  ${frag}
`;

