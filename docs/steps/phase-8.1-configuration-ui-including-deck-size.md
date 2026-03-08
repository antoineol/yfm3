Phase 8 added a parameter to change the deck size. There will be more configurations very soon that we should able to change in the UI. Configurations will be accessible from different layers. Implement it.

Assumption that could make it easier: the program is designed to run either in the browser or in unit tests. So race conditions with 2 users running the same code with different config shouldn't happen. I.e. global variables seem to be a valid option, as long as they are properly updated when the user changes settings.
