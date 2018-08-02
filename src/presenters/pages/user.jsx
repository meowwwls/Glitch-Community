import React from 'react';
import PropTypes from 'prop-types';

import {getAvatarStyle, getProfileStyle} from '../../models/user';
import * as assets from '../../utils/assets';

import {AuthDescription} from '../includes/description-field.jsx';
import EditableField from '../includes/editable-field.jsx';
import EntityEditor from '../entity-editor.jsx';
import Thanks from '../includes/thanks.jsx';

import DeletedProjects from '../deleted-projects.jsx';
import EntityPageProjects from '../entity-page-projects.jsx';
import {ProfileContainer, ImageButtons} from '../includes/profile.jsx';

const NameAndLogin = ({name, login, id, isAuthorized, updateName, updateLogin}) => {
  if(!login) {
    // Just an ID? We're anonymous.
    return <h1 className="login">@{id}</h1>;
  }

  if(!isAuthorized) {
    if(!name) {
      //promote login to an h1.
      return <h1 className="login">@{login}</h1>;
    }
    return (
      <React.Fragment>
        <h1 className="username">{name}</h1>
        <h2 className="login">@{login}</h2>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <h1 className="username"><EditableField value={name||""} update={updateName} placeholder='Display name?'/></h1>
      <h2 className="login"><EditableField value={login} update={updateLogin} prefix="@" placeholder='User ID?'/></h2>
    </React.Fragment>
  );
};
NameAndLogin.propTypes = {
  name: PropTypes.string,
  login: PropTypes.string,
  id: PropTypes.number.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
  updateName: PropTypes.func,
  updateLogin: PropTypes.func,
};

const UserPage = ({
  user: { //has science gone too far?
    id, login, name, description, thanksCount,
    avatarUrl, color,
    hasCoverImage, coverColor,
    pins, projects,
  },
  api, isAuthorized,
  updateDescription,
  updateName, updateLogin,
  uploadCover, clearCover,
  uploadAvatar,
  addPin, removePin,
  leaveProject, deletedProjects,
  deleteProject, undeleteProject,
  getProjects, setDeletedProjects,
  _cacheCover,
}) => (
  <main className="profile-page user-page">
    <section>
      <ProfileContainer
        avatarStyle={getAvatarStyle({avatarUrl, color})}
        coverStyle={getProfileStyle({id, hasCoverImage, coverColor, cache: _cacheCover})}
        coverButtons={isAuthorized && <ImageButtons name="Cover" uploadImage={uploadCover} clearImage={hasCoverImage ? clearCover : null}/>}
        avatarButtons={isAuthorized ? <ImageButtons name="Avatar" uploadImage={uploadAvatar} /> : null }
      >
        <NameAndLogin {...{name, login, id, isAuthorized, updateName, updateLogin}}/>
        <Thanks count={thanksCount}/>
        <AuthDescription authorized={isAuthorized} description={description} update={updateDescription} placeholder="Tell us about yourself"/>
      </ProfileContainer>
    </section>
    <EntityPageProjects
      projects={projects} pins={pins} isAuthorized={isAuthorized}
      api={api} addPin={addPin} removePin={removePin}
      projectOptions={{leaveProject, deleteProject}}
    />
    {isAuthorized && <DeletedProjects api={api} setDeletedProjects={setDeletedProjects} deletedProjects={_deletedProjects} undelete={undeleteProject}/>}
  </main>
);
UserPage.propTypes = {
  isAuthorized: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    login: PropTypes.string,
    id: PropTypes.number.isRequired,
    thanksCount: PropTypes.number.isRequired,
    hasCoverImage: PropTypes.bool.isRequired,
    avatarUrl: PropTypes.string,
    color: PropTypes.string.isRequired,
    coverColor: PropTypes.string,
  }).isRequired,
  uploadAvatar: PropTypes.func.isRequired,
  uploadCover: PropTypes.func.isRequired,
  clearCover: PropTypes.func.isRequired,
  leaveProject: PropTypes.func.isRequired,
  _cacheCover: PropTypes.number.isRequired,
};


const UserPageContainer = ({api, user, currentUserModel, getProjects}) => (
  <UserEditor api={api} initialUser={user} currentUserModel={currentUserModel}>
    {(user, funcs, isAuthorized) => (
      <UserPage api={api} user={user} {...funcs} {...{isAuthorized, getProjects}}/>
    )}
  </UserEditor>
);

export default UserPageContainer;