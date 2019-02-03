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
