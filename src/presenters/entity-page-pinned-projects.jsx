/* global analytics APP_URL */

import React from 'react';
import PropTypes from 'prop-types';

import ProjectsList from './projects-list.jsx';
import FeaturedProjectOptionsPop from "./pop-overs/featured-project-options-pop.jsx";
import {EditButton, RemixButton, ReportButton} from './includes/project-actions.jsx';
import AddProjectToCollection from './includes/add-project-to-collection.jsx';

import {CurrentUserConsumer} from './current-user.jsx';

/* globals Set */

function trackRemix(id, domain) {
  analytics.track("Click Remix", {
    origin: "project page",
    baseProjectId: id,
    baseDomain: domain,
  });
}

const FeaturedProject = ({api, isAuthorized, currentUser, featuredProjectDomain, projects, addProjectToCollection,}) => {
  return(
    <>
      <h2 style={{marginTop: 2+"em"}}>Pinned Projects<span className="emoji pushpin emoji-in-title"></span></h2>
      <section id="embed" style={{marginTop: 0}}>      
        {isAuthorized && <FeaturedProjectOptionsPop />}
        <div className="glitch-embed-wrap">
          <iframe title="embed"
            src={`${APP_URL}/embed/#!/embed/${featuredProjectDomain}?path=README.md&previewSize=100`}
            allow="geolocation; microphone; camera; midi; encrypted-media"
          ></iframe>
        </div>

        {isAuthorized ?
          <div className="buttons buttons-left">
            <EditButton className="button-small button-edit" name={featuredProjectDomain} isMember={isAuthorized}/>
          </div>
          :
          <div className="buttons buttons-left">
            <ReportButton className="button-small" name={featuredProjectDomain} id={featuredProjectDomain}/>
          </div>

        }

        {isAuthorized && 
          <p className="hint">Tweak the way this embed looks by editing the project and going to <b>Share > Embed Project</b></p>
        }

        <div className="buttons buttons-right">

          {currentUser.login && <AddProjectToCollection className="button-small" api={api} currentUser={currentUser} project={projects[0]} fromProject={true} addProjectToCollection={addProjectToCollection}/>}

          {/* Can add to track remix later 
            onClick={() => trackRemix(projects[0].id, projects[0].domain)}
          */}
          <RemixButton className="button-small"
            name={projects[0].domain} isMember={isAuthorized}
          />
        </div>
      </section>
    </>
    )
};

const EntityPagePinnedProjects = ({api, projects, pins, currentUser, isAuthorized, removePin, projectOptions, featuredProjectDomain, addProjectToCollection}) => {
  const pinnedSet = new Set(pins.map(({projectId}) => projectId));
  const pinnedProjects = projects.filter( ({id}) => pinnedSet.has(id)).slice(1);
  
  const pinnedVisible = (isAuthorized || pinnedProjects.length) && projects.length;
  
  return (
    <>
      {!!pinnedVisible && !!pinnedProjects.length && (
       
       <>
        <FeaturedProject 
          {...{api, isAuthorized, currentUser, projects, featuredProjectDomain, addProjectToCollection }}
        />
       
        <ProjectsList title={""}
          projects={pinnedProjects}
          api={api} 
          projectOptions={isAuthorized ? {removePin, ...projectOptions} 
            : (currentUser && currentUser.login ? {...projectOptions} : {})
          }
        />
       </>
      )}
    </>
  );
};
EntityPagePinnedProjects.propTypes = {
  addProjectToCollection: PropTypes.func,
  api: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  featuredProjectDomain: PropTypes.string,
  isAuthorized: PropTypes.bool.isRequired,
  projects: PropTypes.array.isRequired,
  pins: PropTypes.arrayOf(PropTypes.shape({
    projectId: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  removePin: PropTypes.func.isRequired,
  projectOptions: PropTypes.object,
};

const EntityPagePinnedProjectsContainer = ({api, projects, ...props}) => (
  <CurrentUserConsumer>
    {currentUser => (
      <EntityPagePinnedProjects api={api} projects={projects} currentUser={currentUser} {...props}/>
    )}
  </CurrentUserConsumer>
);

export default EntityPagePinnedProjectsContainer;  
