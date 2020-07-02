import React, {Component} from 'react';
// import FooterMenu from '../components/FooterMenu';
// import { getAllBooks } from '../utils/http'
import BookCard from '../components/BookCard';
// import BookSlide from '../components/BookSlide';

import AddBookModal from '../components/AddBookModal';

import {
  // SafeAreaView,
  ScrollView,
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  // TouchableNativeFeedbackBase,
  // InteractionManager,
  KeyboardAvoidingView,
  ImageBackground,
  BackHandler,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Spinner,
  Container,
  Fab,
  // Header,
  Item,
  // Content,
  // Footer,
  Input,
  // FooterTab,
  Button,
  Icon,
  Text,
} from 'native-base';

import Filter from '../components/Filter';
import {refreshTokenActionCreator} from '../redux/actions/UserAction.js';

import {
  getAllBooksActionCreator,
  getBooksNextPageActionCreator,
} from '../redux/actions/BookAction';
import {getAuthorActionCreator} from '../redux/actions/AuthorAction';
import {getGenreActionCreator} from '../redux/actions/GenreAction';
import {getUserActionCreator} from '../redux/actions/UserAction';
import {getUserBorrowActionCreator} from '../redux/actions/BorrowAction';

// import {Form} from 'react-redux'
import {connect} from 'react-redux';
// import '../styles/Home.css'
// const qs = require('querystring')

class AllBooks extends Component {
  constructor() {
    super();
    this.state = {
      startpage: 1,
      page: 1,
      limit: 6,
      orderBy: 'asc',
      sortBy: 'id',
      token: '',
      title: '',
      data: [],
      pagination: {},
      role: '',
      id_user: '',
      refreshing: false,
      loading: false,
      refreshToken: '',
      reload: false,
      borrowTemp: [],
      returnTemp: [],
      isNavBarHidden: false,
      loadMore: false,
      upButton: false,
      showbookSlide: true,
    };
    this.onEndReachedCalledDuringMomentum = true;
  }
  handleScroll = () => {
    this.setState({isNavBarHidden: true});
  };

  _listViewOffset = 0;
  getToken = async () => {
    const value = await AsyncStorage.getItem('token');

    // console.log(value);
    await this.setState({token: value});
  };
  getRole = async () => {
    const value = await AsyncStorage.getItem('role');
    if (value !== null) {
      // console.log(value);
      await this.setState({role: value});
    }
  };
  getIdUser = async () => {
    const value = await AsyncStorage.getItem('id_user');
    if (value !== null) {
      // console.log(value);
      await this.setState({role: value});
    }
  };
  getStoreData = async name => {
    const value = await AsyncStorage.getItem(`${name}`);
    // console.log(value)
    this.setState({name: value});
    return value;
  };
  refreshToken = async () => {
    const {refreshToken} = this.state;
    await this.props.refreshTokenAction({refreshToken});
    this.props.navigation.navigate('Books');
  };
  handlerSearch = async (name, e) => {
    // e.preventDefault()
    if (!e) {
      this.setState({title: '', isUpdate: true}, () => {
        this.getData();
      });
    }
    this.setState({[name]: e});
  };
  handlerChange = async (name, e) => {
    // this.setState({loading: true});
    this.setState({[name]: e, loading: true}, () => {
      this.getData();
    });
  };
  handlerPage = async e => {
    this.setState({page: e.target.id}, () => {
      this.getData();
    });
  };
  handlerNextPage = e => {
    let currentPage = this.state.page;
    currentPage++;
    if (currentPage > this.props.pagination.totalPage) {
      currentPage = this.props.pagination.totalPage;
      this.props.pagination.next_page = this.props.pagination.totalPage;
      return false;
    }
    if (this.props.pagination.totalPage === 1) {
      currentPage = this.props.pagination.totalPage;
    } else {
      this.setState({page: this.props.pagination.next_page}, () => {
        this.getData();
      });
    }
  };
  handlerLastPage = () => {
    this.setState({page: this.props.pagination.totalPage}, () => {
      this.getData();
    });
  };
  handlerStartPage = () => {
    this.setState({page: 1}, () => {
      this.getData();
    });
  };
  handlerPrevPage = async e => {
    let currentPage = this.state.page;
    currentPage--;
    if (currentPage < 1) {
      currentPage = this.props.pagination.startpage;
    } else {
      this.setState(
        {[e.target.name]: e.target.value, page: currentPage},
        () => {
          this.getData();
        },
      );
    }
  };
  getData = async () => {
    console.log('sss ' + this.state.token);
    const {page, limit, orderBy, sortBy, title} = this.state;
    const pageQuery = {
      page: 1,
      limit: 6,
      orderBy: orderBy,
      sortBy: sortBy,
      title: title,
    };
    this.setState({refreshing: false});

    // console.log(this.props.isFulfilled)
    await this.props.getAllBooksAction(this.state.token, pageQuery);
    this.setState({loading: false});
  };
  getDataGenre = async () => {
    await this.props.getGenreAction(
      this.props.token ? this.props.token : this.state.token,
    );
  };
  getDataBorrowUser = async () => {
    await this.props.getUserBorrowAction(
      this.props.token ? this.props.token : this.state.token,
    );
  };
  getDataAuthor = async () => {
    await this.props.getAuthorAction(
      this.props.token ? this.props.token : this.state.token,
    );
  };
  getDataUser = async () => {
    await this.props.getUserAction(
      this.props.token ? this.props.token : this.state.token,
    );
  };

  onButtonPress = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    // then navigate

    this.props.navigation.goBack(null);
  };

  handleBackButton = () => {
    this.onButtonPress();

    return true;
  };
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }
  componentDidMount = async () => {
    if (
      (await this.getStoreData('token')) === '' ||
      (await this.getStoreData('token')) === null
    ) {
      Alert.alert('please login');
      this.props.navigation.navigate('Login');
    }
    console.disableYellowBox = true;
    // this.setState({ isUpdate: false },
    //   () => { this.getData() }
    // )
    if (this.props.data.length <= 0) {
      await this.getData();
    }
    await this.getData();
    await this.getToken();
    await this.getIdUser();

    await this.getRole();
    await this.getStoreData('refreshToken');

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    // eslint-disable-next-line eqeqeq
    if ((this.props.role ? this.props.role : this.state.role) == '1') {
      if (this.props.dataAuthor.length <= 0) {
        this.getDataAuthor();
      }

      this.getDataUser();

      if (this.props.dataGenre.length <= 0) {
        this.getDataGenre();
      }
    }
    // eslint-disable-next-line eqeqeq
    if (this.props.role ? this.props.role : this.state.role == '2') {
      this.getDataBorrowUser();
    }
  };
  componentDidUpdate(prevprops, prevState) {
    //INI DI UNCOMMENT KLO MAU FETCH ULANG SEHABIS BORROW ATAU RETURN
    // if(prevprops.borrowTemp.length!= this.props.borrowTemp.length){
    //   this.getData()
    //   // this.componentDidMount()
    // }
    if (prevprops.returnTemp.length !== this.props.returnTemp.length) {
      this.getData();
      // this.componentDidMount()
    }
  }
  goToTop = () => {
    this.scroll.scrollTo({x: 0, y: 0, animated: true});
  };
  renderHeader = () => {
    return (
      // <Header style={{backgroundColor:'darklategrey'}} searchBar rounded>
      <>
        <Filter
          // style={navbarStyle}
          orderBy={this.state.orderBy}
          sortBy={this.state.sortBy}
          handleOrder={e => this.handlerChange('orderBy', e)}
          handleSort={e => this.handlerChange('sortBy', e)}
        />
      </>
    );
  };
  handleRefresh = () => {
    this.setState({refreshing: true, page: 1, limit: 6}, () => {
      this.getData();
    });
  };
  handleLoadMore = () => {
    if (this.props.pagination.page < this.props.pagination.totalPage) {
      const pageQuery = {
        page: this.props.pagination.page + 1,
        limit: this.state.limit,
        orderBy: this.props.pagination.orderBy,
        sortBy: this.props.pagination.sortBy,
        title: this.props.pagination.title,
      };
      this.setState({refreshing: false});

      if (!this.onEndReachedCalledDuringMomentum) {
        this.setState(
          {
            page: this.props.pagination.page + 1,
            // limit: this.state.limit + 6,
            loadMore: true,
          },
          () => {
            this.props.getBooksNextPageAction(this.state.token, pageQuery);
          },
        );

        this.onEndReachedCalledDuringMomentum = true;
      }
    }
    // console.warn('handleload')
  };
  _renderFooter = () => {
    if (!this.state.loadMore) {
      return null;
    }

    return (
      <View style={styles.loadMoreStyle}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  };
  render() {
    return (
      <>
        {this.props.data.length <= 0 && this.props.isLoading === true ? (
          <Container style={styles.spinnerStyle}>
            <Spinner color="darkcyan" />
          </Container>
        ) : (
          <KeyboardAvoidingView style={styles.container}>
            <ImageBackground
              source={require('../../image/background.jpeg')}
              style={styles.container}>
              <Button
                transparent
                iconLeft
                style={styles.backButton}
                onPress={() => this.props.navigation.goBack(null)}>
                <Icon style={styles.backIcon} name="ios-arrow-back" />
              </Button>
              <Item style={styles.bgColor}>
                <Icon name="ios-search" style={styles.whiteColor} />
                <Input
                  placeholder="Search"
                  placeholderTextColor="white"
                  style={styles.whiteColor}
                  onSubmitEditing={this.handlerChange}
                  onChangeText={e => this.handlerSearch('title', e)}
                />
              </Item>
              <View style={styles.viewFilter}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}>
                  <Filter
                    orderBy={this.props.pagination.orderBy}
                    sortBy={this.props.pagination.sortBy}
                    handleOrder={e => this.handlerChange('orderBy', e)}
                    handleTitle={() => this.handlerChange('sortBy', 'title')}
                    handleAuthor={() => this.handlerChange('sortBy', 'author')}
                    handleGenre={() => this.handlerChange('sortBy', 'genre')}
                    handleId={() => this.handlerChange('sortBy', 'id')}
                  />
                </ScrollView>
              </View>
              {this.props.pagination.itemFound <= 0 ? (
                <Container>
                  <Text style={styles.noResult}>No Result Found</Text>
                </Container>
              ) : this.state.loading ? (
                <Container style={styles.spinnerStyle}>
                  <Spinner color="darkcyan" />
                </Container>
              ) : (
                <FlatList
                  style={styles.whiteBackground}
                  data={this.props.data}
                  renderItem={({item}) => (
                    <BookCard
                      data={item}
                      key={item.id}
                      role={this.props.role ? this.props.role : this.state.role}
                      token={
                        this.props.token ? this.props.token : this.state.token
                      }
                      id_user={this.state.id_user}
                      refresh={this.componentDidMount}
                      props={this.props}
                    />
                  )}
                  // initialNumToRender={10}
                  keyExtractor={(item, index) => item.id.toString()}
                  // ListHeaderComponent={this.renderHeader}

                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this.handleRefresh}
                    />
                  }
                  onEndReached={this.handleLoadMore}
                  onEndReachedThreshold={0.1}
                  onMomentumScrollBegin={() => {
                    // eslint-disable-next-line no-sequences
                    (this.onEndReachedCalledDuringMomentum = false),
                      this.setState({loadMore: false});
                  }}
                  ref={ref => {
                    this.flatListRef = ref;
                  }}
                  ListFooterComponent={this._renderFooter}
                  onScrollEndDrag={() =>
                    this.setState({upButton: true, showbookSlide: false})
                  }
                  // onScroll={() => this.setState({showbookSlide: false})}
                />
              )}
              {this.state.upButton ? (
                <Fab
                  style={styles.fabGoTop}
                  position="bottomRight"
                  onPress={() => {
                    this.flatListRef.scrollToOffset({
                      animated: true,
                      offset: 0,
                      // eslint-disable-next-line no-sequences
                    }),
                      this.setState({upButton: false, showbookSlide: true});
                  }}>
                  <Icon name="ios-arrow-up" />
                </Fab>
              ) : (
                <></>
              )}
            </ImageBackground>
          </KeyboardAvoidingView>
        )}

        {/* eslint-disable-next-line eqeqeq */}
        {(this.props.role ? this.props.role : this.state.role) == '1' ? (
          <AddBookModal
            token={this.props.token ? this.props.token : this.state.token}
            props={this.props}
          />
        ) : (
          <></>
        )}
      </>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadMoreStyle: {
    position: 'relative',
    width: '100%',
    height: '100%',
    paddingVertical: 20,
    // borderTopWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  whiteBackground: {backgroundColor: 'white'},
  fabGoTop: {backgroundColor: 'rgba(52, 52, 52, 0.6)', marginBottom: 60},
  bgColor: {backgroundColor: 'rgba(52, 52, 52, 0.2)', marginLeft: 60},
  whiteColor: {color: 'white'},
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  noResult: {paddingLeft: 150, paddingTop: 200},
  title: {
    fontSize: 32,
  },
  viewFilter: {backgroundColor: 'rgba(52, 52, 52, 0.6)', height: 50},
  spinnerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  backButton: {
    marginLeft: 0,
    width: 100,
    position: 'absolute',
    marginTop: 5,
  },
  backIcon: {color: 'white'},
});
const mapStateToProps = ({
  reducerBook,
  reducerGenre,
  reducerAuthor,
  reducerUser,
  reducerBorrow,
}) => {
  return {
    isRejected: reducerBook.isRejected,
    isFulfilled: reducerBook.isFulfilled,
    isLoading: reducerBook.isLoading,
    data: reducerBook.data,
    dataGenre: reducerGenre.data,
    dataAuthor: reducerAuthor.data,
    pagination: reducerBook.pagination,
    errorToken: reducerBook.errorToken,
    dataUser: reducerUser.data,
    error: reducerBook.error,
    token: reducerUser.token,
    role: reducerUser.role,
    id_user: reducerUser.id_user,
    borrowTemp: reducerBorrow.borrow,
    returnTemp: reducerBorrow.return,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    getAllBooksAction: (token, pageQuery) => {
      dispatch(getAllBooksActionCreator(token, pageQuery));
    },
    getGenreAction: token => {
      dispatch(getGenreActionCreator(token));
    },
    getAuthorAction: token => {
      dispatch(getAuthorActionCreator(token));
    },
    getUserAction: token => {
      dispatch(getUserActionCreator(token));
    },
    getUserBorrowAction: token => {
      dispatch(getUserBorrowActionCreator(token));
    },
    refreshTokenAction: async body => {
      await dispatch(refreshTokenActionCreator(body));
    },
    getBooksNextPageAction: (token, pageQuery) => {
      dispatch(getBooksNextPageActionCreator(token, pageQuery));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AllBooks);
