import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Container from './Container';

const getJobsList = gql`
query getJobsList {
  jobs(first: 6) {
    id
    result
    startTime
    targetBranch
    trigger
    numberOfThreads
    numberOfFlows
    sourceBranch
    tags
  }
}
`;

export default graphql(getJobsList)(Container);