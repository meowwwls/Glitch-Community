import React from 'react';
import PropTypes from 'prop-types';
import { getAvatarUrl, getLink } from '../models/project';
import { ProjectLink } from './includes/link';
import Markdown from '../components/text/markdown';
import ProjectOptionsPop from './pop-overs/project-options-pop';
import UsersList from './users-list';
import Note from './note';
import WrappingLink from './includes/wrapping-link';
import Image from '../components/image/image';

const ProjectItem = ({ project, collection, ...props }) => (
  <li>
    <Note
      collection={collection}
      project={project}
      update={props.projectOptions.updateOrAddNote ? (note) => props.projectOptions.updateOrAddNote({ note, projectId: project.id }) : null}
      hideNote={props.hideNote}
    />
    <UsersList glitchTeam={project.showAsGlitchTeam} users={project.users} extraClass="single-line" teams={project.teams} />
    <ProjectOptionsPop project={project} {...props} />
    <WrappingLink href={getLink(project)} className="button-area">
      <div className={['project', project.private ? 'private-project' : ''].join(' ')} data-track="project" data-track-label={project.domain}>
        <div className="project-container">
          <Image className="avatar" src={getAvatarUrl(project.id)} alt="" />
          <ProjectLink project={project} className="button">
            <span className="project-badge private-project-badge" aria-label="private" />
            <div className="project-name">{project.domain}</div>
          </ProjectLink>
          <div className="description">
            <Markdown length={80}>{project.description}</Markdown>
          </div>
          <div className="overflow-mask" />
        </div>
      </div>
    </WrappingLink>
  </li>
);

ProjectItem.propTypes = {
  author: PropTypes.object,
  hideNote: PropTypes.func,
  project: PropTypes.shape({
    collectionCoverColor: PropTypes.string,
    description: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    private: PropTypes.bool,
    showAsGlitchTeam: PropTypes.bool.isRequired,
    users: PropTypes.array.isRequired,
    teams: PropTypes.array,
  }).isRequired,
  projectOptions: PropTypes.object,
};

ProjectItem.defaultProps = {
  author: null,
  projectOptions: {},
  hideNote: () => {},
};

export default ProjectItem;
