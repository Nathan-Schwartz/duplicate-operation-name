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

const frag1 = gql`
  fragment tsdetails on Author {
    firstName
    lastName
  }
`;

const query1 = gql`
  query {
    author {
      ...tsdetails
    }
  }

  ${frag1}
`;
