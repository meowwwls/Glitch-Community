import React from 'react';
import PropTypes from 'prop-types';

import { Redirect } from 'react-router-dom';

import Helmet from 'react-helmet';
import _ from 'lodash';
import Layout from '../layout';
import { isDarkColor, getLink, getOwnerLink } from '../../models/collection';

import { AnalyticsContext } from '../analytics';
import { DataLoader } from '../includes/loader';
import { ProjectsUL } from '../projects-list';
import NotFound from '../includes/not-found';

import { AuthDescription } from '../includes/description-field';
import CollectionEditor from '../collection-editor';

import EditCollectionColor from '../includes/edit-collection-color';
import EditCollectionNameAndUrl from '../includes/edit-collection-name-and-url';
import AddCollectionProject from '../includes/add-collection-project';
import ReportButton from '../pop-overs/report-abuse-pop';

import CollectionAvatar from '../includes/collection-avatar';
import { TeamTile } from '../teams-list';
import { UserTile } from '../users-list';

import { CurrentUserConsumer } from '../current-user';

import Heading from '../../components/text/heading';

function syncPageToUrl(collection, url) {
  history.replaceState(null, null, getLink({ ...collection, url }));
}

class DeleteCollectionBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false,
    };
  }

  render() {
    if (this.state.done) {
      return <Redirect to={getOwnerLink(this.props.collection)} />;
    }
    return (
      <button
        className="button delete-collection button-tertiary"
        onClick={() => {
          if (!window.confirm('Are you sure you want to delete your collection?')) {
            return;
          }
          this.props.deleteCollection();
          this.setState({ done: true });
        }}
      >
        Delete Collection
      </button>
    );
  }
}

DeleteCollectionBtn.propTypes = {
  collection: PropTypes.shape({
    team: PropTypes.object,
    user: PropTypes.object,
    url: PropTypes.string.isRequired,
  }).isRequired,
  deleteCollection: PropTypes.func.isRequired,
};

const CollectionPageContents = ({
  api,
  collection,
  currentUser,
  deleteCollection,
  currentUserIsAuthor,
  updateNameAndUrl,
  updateDescription,
  addProjectToCollection,
  removeProjectFromCollection,
  updateColor,
  updateOrAddNote,
  addNoteField,
  hideNote,
  ...props
}) => {
  const collectionHasProjects = !!collection && !!collection.projects;
  const userIsLoggedIn = currentUser && currentUser.login;

  return (
    <>
      <Helmet>
        <title>{collection.name}</title>
      </Helmet>
      <main className="collection-page">
        <article className="collection-full projects" style={{ backgroundColor: collection.coverColor }}>
          <header className={`collection ${isDarkColor(collection.coverColor) ? 'dark' : ''}`}>
            <div className="collection-image-container">
              <CollectionAvatar color={collection.coverColor} />
            </div>

            <EditCollectionNameAndUrl
              isAuthorized={currentUserIsAuthor}
              name={collection.name}
              url={collection.url}
              update={(data) => updateNameAndUrl(data).then(() => syncPageToUrl(collection, data.url))}
            />

            {collection.team && <TeamTile team={collection.team} />}
            {collection.user && <UserTile user={collection.user} />}

            <div className="collection-description">
              <AuthDescription
                authorized={currentUserIsAuthor}
                description={collection.description}
                update={updateDescription}
                placeholder="Tell us about your collection"
              />
            </div>

            {currentUserIsAuthor && <EditCollectionColor update={updateColor} initialColor={collection.coverColor} />}
          </header>
          {
            !collectionHasProjects && currentUserIsAuthor && (
              <div className="empty-collection-hint">
                <img
                  src="https://cdn.glitch.com/1afc1ac4-170b-48af-b596-78fe15838ad3%2Fpsst-pink.svg?1541086338934"
                  alt=""
                />
                <p>You can add any project, created by any user</p>
              </div>
            )
          }
          {
            !collectionHasProjects && !currentUserIsAuthor && (
              <div className="empty-collection-hint">
                No projects to see in this collection just yet.
              </div>
            )
          }
          {
            collectionHasProjects && (
              <>
                <div className="collection-contents">
                  <div className="collection-project-container-header">
                    <Heading tagName="h3">
                      Projects ({collection.projects.length})
                    </Heading>
                    {
                      currentUserIsAuthor && (
                        <AddCollectionProject
                          addProjectToCollection={addProjectToCollection}
                          collection={collection}
                          api={api}
                          currentUser={currentUser}
                        />
                      )
                    }
                  </div>
                  {
                    currentUserIsAuthor && (
                      <ProjectsUL
                        {...props}
                        projects={collection.projects}
                        author={collection.user}
                        api={api}
                        collectionCoverColor={collection.coverColor}
                        hideNote={hideNote}
                        projectOptions={{
                          removeProjectFromCollection,
                          addProjectToCollection,
                          updateOrAddNote,
                          addNoteField,
                        }}
                      />
                    )
                  }
                  {
                    !currentUserIsAuthor && userIsLoggedIn && (
                      <ProjectsUL
                        {...props}
                        projects={collection.projects}
                        author={collection.user}
                        api={api}
                        collectionCoverColor={collection.coverColor}
                        projectOptions={{
                          addProjectToCollection,
                        }}
                      />
                    )
                  }
                  {
                    !currentUserIsAuthor && !userIsLoggedIn && (
                      <ProjectsUL
                        projects={collection.projects}
                        author={collection.user}
                        api={api}
                        collectionCoverColor={collection.coverColor}
                        projectOptions={{}}
                      />
                    )
                  }
                </div>
              </>
            )}
        </article>
        {!currentUserIsAuthor && <ReportButton reportedType="collection" reportedModel={collection} />}
      </main>
      {currentUserIsAuthor && <DeleteCollectionBtn collection={collection} deleteCollection={deleteCollection} />}
    </>
  );
};

CollectionPageContents.propTypes = {
  addProjectToCollection: PropTypes.func.isRequired,
  api: PropTypes.any,
  collection: PropTypes.shape({
    avatarUrl: PropTypes.string,
    coverColor: PropTypes.string,
    description: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    projects: PropTypes.array.isRequired,
  }).isRequired,
  currentUser: PropTypes.object.isRequired,
  deleteCollection: PropTypes.func.isRequired,
  currentUserIsAuthor: PropTypes.bool.isRequired,
  removeProjectFromCollection: PropTypes.func.isRequired,
  updateOrAddNote: PropTypes.func,
  addNoteField: PropTypes.func,
  hideNote: PropTypes.func,
};

CollectionPageContents.defaultProps = {
  api: null,
  updateOrAddNote: null,
  addNoteField: null,
  hideNote: null,
};

async function loadCollection(api, ownerName, collectionName) {
  try {
    const { data: collectionId } = await api.get(`collections/${ownerName}/${collectionName}`);
    const { data: collection } = await api.get(`collections/${collectionId}`);

    // fetch projects in depth
    if (collection.projects.length) {
      const { data: projects } = await api.get(`projects/byIds?ids=${collection.projects.map(({ id }) => id).join(',')}`);
      collection.projects = projects.map((project) => {
        const collectionProject = _.find(collection.collectionProjects, (p) => p.projectId === project.id);
        if (collectionProject && collectionProject.annotation && ) {
          project.note = _.trim(collectionProject.annotation);
          project.isAddingANewNote = true;
        }
        project.collectionCoverColor = collection.coverColor;
        return project;
      });
    }
    return collection;
  } catch (error) {
    if (error && error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

const CollectionPage = ({ api, ownerName, name, ...props }) => (
  <Layout api={api}>
    <DataLoader get={() => loadCollection(api, ownerName, name)}>
      {(collection) =>
        collection ? (
          <AnalyticsContext
            properties={{ origin: 'collection' }}
            context={{
              groupId: collection.team ? collection.team.id.toString() : '0',
            }}
          >
            <CurrentUserConsumer>
              {(currentUser) => (
                <CollectionEditor api={api} initialCollection={collection}>
                  {(collectionFromEditor, funcs, currentUserIsAuthor) => (
                    <CollectionPageContents
                      collection={collectionFromEditor}
                      api={api}
                      currentUser={currentUser}
                      currentUserIsAuthor={currentUserIsAuthor}
                      {...funcs}
                      {...props}
                    />
                  )}
                </CollectionEditor>
              )}
            </CurrentUserConsumer>
          </AnalyticsContext>
        ) : (
          <NotFound name={name} />
        )
      }
    </DataLoader>
  </Layout>
);

export default CollectionPage;
