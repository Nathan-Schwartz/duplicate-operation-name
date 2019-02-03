const frag = gql`
  query jsOtherQuery {
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

// const frag = gql`
//   query jsOtherQuery {
//     person {
//       firstName
//       lastName
//     }
//   }
// `;

// const query = gql`
//   query {
//     author {
//       firstName
//       lastName
//     }
//   }
// `;
