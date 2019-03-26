import PropTypes from 'prop-types';
import React from 'react';

import { UserLink } from './includes/link';
import Markdown from '../components/text/markdown';
import { Thanks } from './includes/thanks';

import WrappingLink from './includes/wrapping-link';
import Button from '../components/buttons/button';

import { ANON_AVATAR_URL, getAvatarUrl, getLink, getProfileStyle } from '../models/user';

function addDefaultSrc(event) {
  event.target.src = ANON_AVATAR_URL; // eslint-disable-line
}

export default function UserItem({ user }) {
  const style = getProfileStyle({ ...user, size: 'medium' });
  return (
    <WrappingLink href={getLink(user)} className="item button-area">
      <>
        <div className="cover" style={style} />
        <div className="content">
          <img onError={addDefaultSrc} className="avatar" src={getAvatarUrl(user)} alt="" />
          <div className="information">
            {user.name ? (
              <>
                <UserLink user={user}>
                  <Button>{user.name}</Button>
                </UserLink>
                <p className="name">@{user.login}</p>
              </>
            ) : (
              <UserLink user={user} className="button">
                @{user.login}
              </UserLink>
            )}
            {!!user.description && (
              <p className="description">
                <Markdown length={96}>{user.description}</Markdown>
              </p>
            )}
            {user.thanksCount > 0 && <Thanks count={user.thanksCount} />}
          </div>
        </div>
      </>
    </WrappingLink>
  );
}

UserItem.propTypes = {
  user: PropTypes.shape({
    avatarUrl: PropTypes.string,
    coverColor: PropTypes.string,
    description: PropTypes.string,
    hasCoverImage: PropTypes.bool.isRequired,
    id: PropTypes.number.isRequired,
    login: PropTypes.string.isRequired,
    name: PropTypes.string,
    thanksCount: PropTypes.number.isRequired,
  }).isRequired,
};
