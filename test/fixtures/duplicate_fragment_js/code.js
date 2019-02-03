const frag = gql`
  fragment jsdetails on Author {
    firstName
    lastName
  }
`;

const query = gql`
  query {
    author {
      ...jsdetails
    }
  }

  ${frag}
`;

const frag1 = gql`
  fragment jsdetails on Author {
    firstName
    lastName
  }
`;

const query1 = gql`
  query {
    author {
      ...jsdetails
    }
  }

  ${frag1}
`;
