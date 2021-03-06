import React from 'react';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';
import { capitalize, sum } from 'lodash';

import Layout from '../layout';

import { useAPI } from '../../state/api';
import { useCurrentUser } from '../../state/current-user';

import SegmentedButtons from '../../components/buttons/segmented-buttons';
import Badge from '../../components/badges/badge';
import Heading from '../../components/text/heading';

import useErrorHandlers from '../error-handlers';
import { Loader } from '../includes/loader';
import MoreIdeas from '../more-ideas';
import NotFound from '../includes/not-found';
import ProjectsList from '../projects-list';
import TeamItem from '../team-item';
import UserItem from '../user-item';

function generateFilterButtons(filters) {
  const filterButtons = [];
  filters.forEach((filter) => {
    if (filter.hits > 0 || filter.name === 'all') {
      const button = {};
      button.name = filter.name;
      button.contents = (
        <>
          {capitalize(filter.name)}
          {filter.hits && <Badge>{filter.hits}</Badge>}
        </>
      );
      filterButtons.push(button);
    }
  });
  return filterButtons;
}

const FilterContainer = ({ filters, activeFilter, setFilter, query, loaded }) => {
  const totalHits = sum(filters.map((filter) => filter.hits));

  if (!loaded) {
    return (
      <>
        <Loader />
        <h1>All results for {query}</h1>
      </>
    );
  }
  if (loaded && totalHits === 0) {
    return null;
  }

  return (
    <>
      <SegmentedButtons buttons={generateFilterButtons(filters)} onClick={setFilter} />
      {activeFilter === 'all' && <h1>All results for {query}</h1>}
    </>
  );
};

FilterContainer.propTypes = {
  filters: PropTypes.array.isRequired,
  setFilter: PropTypes.func.isRequired,
  /* name of the activeFilter */
  activeFilter: PropTypes.string.isRequired,
  loaded: PropTypes.bool.isRequired,
};

const TeamResults = ({ teams }) => (
  <article>
    <Heading tagName="h2">Teams</Heading>
    <ul className="teams-container">
      {teams ? (
        teams.map((team) => (
          <li key={team.id}>
            <TeamItem team={team} />
          </li>
        ))
      ) : (
        <Loader />
      )}
    </ul>
  </article>
);

const UserResults = ({ users }) => (
  <article>
    <Heading tagName="h2">Users</Heading>
    <ul className="users-container">
      {users ? (
        users.map((user) => (
          <li key={user.id}>
            <UserItem user={user} />
          </li>
        ))
      ) : (
        <Loader />
      )}
    </ul>
  </article>
);

const ProjectResults = ({ addProjectToCollection, projects, currentUser }) => {
  if (!projects) {
    return (
      <article>
        <Heading tagName="h2">Projects</Heading>
        <Loader />
      </article>
    );
  }
  const loggedInUserWithProjects = projects && currentUser.login;
  return loggedInUserWithProjects ? (
    <ProjectsList title="Projects" projects={projects} projectOptions={{ addProjectToCollection }} />
  ) : (
    <ProjectsList title="Projects" projects={projects} />
  );
};

const MAX_RESULTS = 20;

const showResults = (results) => !results || !!results.length;

class SearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: null,
      users: null,
      projects: null,
      /** default to the all filter */
      activeFilter: 'all',
      loadedResults: 0,
    };
    this.addProjectToCollection = this.addProjectToCollection.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }

  componentDidMount() {
    const { handleError } = this.props;
    this.searchTeams().catch(handleError);
    this.searchUsers().catch(handleError);
    this.searchProjects().catch(handleError);
  }

  setFilter(name) {
    this.setState({ activeFilter: name });
  }

  async searchTeams() {
    const { api, query } = this.props;
    const { data } = await api.get(`teams/search?q=${query}`);
    this.setState((prevState) => ({
      teams: data.slice(0, MAX_RESULTS),
      loadedResults: prevState.loadedResults + 1,
    }));
  }

  async searchUsers() {
    const { api, query } = this.props;
    const { data } = await api.get(`users/search?q=${query}`);
    this.setState((prevState) => ({
      users: data.slice(0, MAX_RESULTS),
      loadedResults: prevState.loadedResults + 1,
    }));
  }

  async searchProjects() {
    const { api, query } = this.props;
    const { data } = await api.get(`projects/search?q=${query}`);
    this.setState((prevState) => ({
      projects: data.filter((project) => !project.notSafeForKids).slice(0, MAX_RESULTS),
      loadedResults: prevState.loadedResults + 1,
    }));
  }

  async addProjectToCollection(project, collection) {
    await this.props.api.patch(`collections/${collection.id}/add/${project.id}`);
  }

  render() {
    const { teams, users, projects, activeFilter } = this.state;
    const teamHits = teams ? teams.length : 0;
    const userHits = users ? users.length : 0;
    const projectHits = projects ? projects.length : 0;

    const filters = [
      { name: 'all', hits: null },
      { name: 'teams', hits: teamHits },
      { name: 'users', hits: userHits },
      { name: 'projects', hits: projectHits },
    ];

    const noResults = [teams, users, projects].every((results) => !showResults(results));

    const showTeams = ['all', 'teams'].includes(activeFilter) && showResults(teams);
    const showUsers = ['all', 'users'].includes(activeFilter) && showResults(users);
    const showProjects = ['all', 'projects'].includes(activeFilter) && showResults(projects);

    const loaded = this.state.loadedResults === filters.filter(({ name }) => name !== 'all').length;

    return (
      <main className="search-results">
        <FilterContainer filters={filters} setFilter={this.setFilter} activeFilter={activeFilter} query={this.props.query} loaded={loaded} />
        {showTeams && <TeamResults teams={teams} />}
        {showUsers && <UserResults users={users} />}
        {showProjects && (
          <ProjectResults projects={projects} currentUser={this.props.currentUser} addProjectToCollection={this.addProjectToCollection} />
        )}
        {noResults && <NotFound name="any results" />}
      </main>
    );
  }
}
SearchResults.propTypes = {
  api: PropTypes.any.isRequired,
  query: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const SearchPage = ({ query }) => {
  const api = useAPI();
  const { currentUser } = useCurrentUser();
  const errorFuncs = useErrorHandlers();
  return (
    <Layout searchQuery={query}>
      {!!query && <Helmet title={`Search for ${query}`} />}
      {query ? <SearchResults {...errorFuncs} api={api} query={query} currentUser={currentUser} /> : <NotFound name="anything" />}
      <MoreIdeas />
    </Layout>
  );
};
SearchPage.propTypes = {
  query: PropTypes.string,
};
SearchPage.defaultProps = {
  query: '',
};

export default SearchPage;
