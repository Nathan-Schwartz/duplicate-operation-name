const frag1 = gql`
  query tsOtherQuery {
    person {
      firstName
      lastName
    }
  }
`;

const query1 = gql`
  query {
    author {
      firstName
      lastName
    }
  }
`;


const frag2 = gql`
  query tsOtherQuery {
    person {
      firstName
      lastName
    }
  }
`;

const query2 = gql`
  query {
    author {
      firstName
      lastName
    }
  }
`;
