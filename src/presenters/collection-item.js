import React from 'react';
import PropTypes from 'prop-types';
import Pluralize from 'react-pluralize';

import Markdown from '../components/text/markdown';
import Text from '../components/text/text';
import CollectionOptionsContainer from './pop-overs/collection-options-pop';
import { TeamLink, UserLink, CollectionLink, ProjectLink } from './includes/link';
import { Loader } from './includes/loader';
import CollectionAvatar from './includes/collection-avatar';
import { TeamAvatar, UserAvatar } from './includes/avatar';
import { getAvatarUrl } from '../models/project';
import { isDarkColor } from '../models/collection';
import Image from '../components/image/image';

const ProjectsPreview = ({ collection, projects, isAuthorized }) => {
  const emptyState = isAuthorized ? (
    <Text>
      {'This collection is empty – add some projects '}
      <span role="img" aria-label="">
        ☝️
      </span>
    </Text>
  ) : (
    <Text>No projects to see in this collection just yet.</Text>
  );

  if (collection.projects.length > 0) {
    return (
      <>
        <ul className="projects-preview">
          {projects.slice(0, 3).map((project) => (
            <li key={project.id} className={`project-container ${project.private ? 'private' : ''}`}>
              <ProjectLink project={project} className="project-link">
                <Image className="avatar" src={getAvatarUrl(project.id)} alt="" />
                <div className="project-name">{project.domain}</div>
                <div className="project-badge private-project-badge" aria-label="private" />
              </ProjectLink>
            </li>
          ))}
        </ul>
        <CollectionLink collection={collection} className="collection-link">
          {`View ${projects.length >= 3 ? 'all' : ''} `}
          <Pluralize count={projects.length} singular="project" />
          <span aria-hidden="true"> →</span>
        </CollectionLink>
      </>
    );
  }
  return <div className="projects-preview empty">{emptyState}</div>;
};

ProjectsPreview.propTypes = {
  projects: PropTypes.any.isRequired,
};

const CollectionItem = ({ collection, deleteCollection, isAuthorized, showCurator }) => {
  const className = `collection${isAuthorized ? ' authorized' : ''} ${showCurator ? ' show-curator' : ''}`;
  return (
    <li>
      {isAuthorized && <CollectionOptionsContainer collection={collection} deleteCollection={deleteCollection} />}

      {showCurator && (
        <div className="collection-curator">
          {collection.user && (
            <UserLink user={collection.user}>
              <UserAvatar user={collection.user} />
            </UserLink>
          )}
          {collection.team && (
            <TeamLink team={collection.team}>
              <TeamAvatar team={collection.team} />
            </TeamLink>
          )}
        </div>
      )}

      {collection && (
        <div className={className} id={`collection-${collection.id}`}>
          <div className="collection-container">
            <CollectionLink
              collection={collection}
              className="collection-info button-area"
              style={{ backgroundColor: collection.coverColor, borderColor: collection.coverColor }}
            >
              <div className="avatar-container" aria-hidden="true">
                <div className="avatar">
                  <CollectionAvatar color={collection.coverColor} collectionId={collection.id} />
                </div>
              </div>
              <div className="collection-name-description button-area">
                <div className="button">
                  <span className="project-badge private-project-badge" aria-label="private" />
                  <div className="project-name">{collection.name}</div>
                </div>
                <div
                  className="description"
                  style={{
                    color: isDarkColor(collection.coverColor) ? 'white' : '',
                  }}
                >
                  <Markdown length={96}>{collection.description}</Markdown>
                </div>
              </div>

              <div className="overflow-mask" />
            </CollectionLink>

            {collection.projects ? (
              <ProjectsPreview projects={collection.projects} color={collection.coverColor} collection={collection} isAuthorized={isAuthorized} />
            ) : (
              <div className="collection-link">
                <Loader />
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};

CollectionItem.propTypes = {
  collection: PropTypes.object.isRequired,
  isAuthorized: PropTypes.bool,
  showCurator: PropTypes.bool,
  deleteCollection: PropTypes.func,
};

CollectionItem.defaultProps = {
  deleteCollection: () => {},
  isAuthorized: false,
  showCurator: false,
};

export default CollectionItem;
