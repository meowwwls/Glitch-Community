axios = require 'axios'

SearchPageTemplate = require "../templates/pages/search-page"
ProjectPresenter = require "./project"

module.exports = (application) ->

  self = 

    application: application
    
    template: ->
      self.searchUsers()
      self.searchProjects()
      templateModel = Object.assign {}, application
      SearchPageTemplate templateModel

    searchProjects: ->
      application.searchResultsProjectsLoaded false
      query = application.searchQuery()
      searchProjectsUrl = "https://api.gomix.com/projects/search?q=#{query}"
      axios.get searchProjectsUrl
        .then (response) ->
          application.searchResultsProjects response.data
          application.searchResultsProjectsLoaded true
        .catch (error) ->
          console.error "searchProjects", error

    searchUsers: ->
      application.searchResultsUsersLoaded false
      query = application.searchQuery()
      console.log "Q", query
      searchUsersUrl = "https://api.gomix.com/users/search?q=#{query}"
      axios.get searchUsersUrl
        .then (response) ->
          application.searchResultsUsers response.data
          application.searchResultsUsersLoaded true
        .catch (error) ->
          console.error "searchUsers", error

    isSearchResultsLoaded: ->
      true if application.searchResultsProjectsLoaded() and application.searchResultsUsersLoaded()
    
    hiddenIfSearchResultsLoaded: ->
      'hidden' if self.isSearchResultsLoaded()

    hiddenUnlessProjects: ->
      'hidden' unless application.searchResultsProjectsLoaded() and application.searchResultsProjects().length
      
    hiddenUnlessUsers: ->
      'hidden' unless application.searchResultsUsersLoaded() and application.searchResultsUsers().length

    hiddenIfNoResults: ->
      'hidden' if self.isSearchResultsLoaded() and ()