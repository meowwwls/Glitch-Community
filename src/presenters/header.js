/* global analytics */

import moment from 'moment-mini';

import HeaderTemplate from '../templates/includes/header';

import ProjectModel from "../models/project";

import UserOptionsPop from "./pop-overs/user-options-pop.jsx";
import SignInPop from "./pop-overs/sign-in-pop.jsx";
import NewProjectPop from "./pop-overs/new-project-pop.jsx";
import Reactlet from "./reactlet";

export default function(application) {
  
  const getTeamsPojo = function(teams) { 
    
    if (!teams || !teams.length) {
      return [];
    }
    
    // Teams load in two passes, first as an incomplete object,
    // then as a model. Filter out the incomplete teams.
    teams = teams.filter(team => team.I !== undefined);
    
    return teams.map(({name, url, teamAvatarUrl}) => ({
      name: name(),
      url: url(),
      teamAvatarUrl: teamAvatarUrl(),
    }));
  };

  var self = {

    application,
    baseUrl: application.normalizedBaseUrl(),
  
    hiddenUnlessUserIsExperienced() {
      if (!application.currentUser().isAnExperiencedUser()) { return 'hidden'; }
    },

    logo() {
      const LOGO_DAY = "https://cdn.gomix.com/2bdfb3f8-05ef-4035-a06e-2043962a3a13%2Flogo-day.svg";
      const LOGO_SUNSET = "https://cdn.gomix.com/2bdfb3f8-05ef-4035-a06e-2043962a3a13%2Flogo-sunset.svg";
      const LOGO_NIGHT = "https://cdn.gomix.com/2bdfb3f8-05ef-4035-a06e-2043962a3a13%2Flogo-night.svg";
      const hour = moment().format('HH');
      if ((hour >= 16) && (hour <=18)) {
        return LOGO_SUNSET;
      } else if ((hour > 18) || (hour <= 8)) {
        return LOGO_NIGHT;
      } 
      return LOGO_DAY;
      
    },

    hiddenIfSignedIn() {
      if (application.currentUser().login()) { return 'hidden'; }
    },
        
    hiddenUnlessSignedIn() {
      if (!application.currentUser().login()) { return 'hidden'; }
    },
        
    SignInPop() {
      return Reactlet(SignInPop);
    },
    
    NewProjectPop() {
      const projectIds = [
        'a0fcd798-9ddf-42e5-8205-17158d4bf5bb', // 'hello-express'
        'cb519589-591c-474f-8986-a513f22dbf88', // 'hello-sqlite'
        '929980a8-32fc-4ae7-a66f-dddb3ae4912c', // 'hello-webpage'
      ];
      const projects = ProjectModel.getProjectsByIds(application.api(), projectIds);
      const fetchedProjects = projects.filter(project => project.fetched());
      const newProjects = fetchedProjects.map((project) => project.asProps());

      return Reactlet(NewProjectPop, {newProjects});
    },

    UserOptionsPop() {
      const user = application.currentUser();
      if(!user.fetched()) {
        return;
      }
      const props = {
        teams: getTeamsPojo(user.teams()),
        profileLink: `/@${user.login()}`,
        avatarUrl: user.avatarUrl(),
        showNewStuffOverlay() {
          return application.overlayNewStuffVisible(true);
        },
        signOut() {
          analytics.track("Logout");
          analytics.reset();
          localStorage.removeItem('cachedUser');
          return location.reload();
        },
      };

      return Reactlet(UserOptionsPop, props);
    },
    
    submit(event) {
      if (event.target.children.q.value.trim().length === 0) {
        return event.preventDefault();
      }
    },
  };
        
  return HeaderTemplate(self);
}
