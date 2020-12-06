import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Card,
  Button,
  Input,
  Header,
} from "react-native-elements";
import { Entypo } from "@expo/vector-icons";
import * as firebase from 'firebase';
import "firebase/firestore";
import Loading from './../components/Loading';

import PostCard from '../components/PostCard';
import { AuthContext } from "../providers/AuthProvider";


const HomeScreen = (props) => {
  const [newPostText, setNewPostText] = useState("");
  const [postList, setPostList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPosts = () => {
    setIsLoading(true);
    firebase
      .firestore()
      .collection('posts')
      .orderBy('created_at','desc')
      .get()
      .then((postList) => {
        setIsLoading(false);
        let posts = [];
        postList.forEach(postItem => {
          posts.push({
            id: postItem.id,
            data: postItem.data(),
          });
        });
        setPostList(posts);
      })

      // .onSnapshot(querySnapShot => {
      //   setIsLoading(false);
      //   let posts = [];
      //   querySnapShot.forEach(doc => {
      //     posts.push({
      //       id: doc.id,
      //       data: doc.data(),
      //     });
      //   });
      //   setPostList(posts);
      // })
      .catch((error) => {
        setIsLoading(false);
        alert(error);
      })
  }

  useEffect(() => {
    loadPosts();
  }, [])

  if (isLoading) {
    return <Loading />;
  } else {
    return (
      <AuthContext.Consumer>
        {(auth) => (
          <View style={styles.rootViewStyle}>
            <Header
              containerStyle={{ borderBottomColor: '#6B778D' }}
              backgroundColor='#6B778D'
              leftComponent={{
                icon: "menu",
                color: "white",
                onPress: function () {
                  props.navigation.toggleDrawer();
                }
              }}
            />
            <Card containerStyle={styles.writePostCardStyle}>
              <Input
                placeholder="What's on your mind?"
                style={{ color: 'white' }}
                inputContainerStyle={styles.inputStyle}
                leftIcon={<Entypo name="pencil" size={24} color="white" />}
                onChangeText={function (currentInput) {
                  setNewPostText(currentInput);
                }}
              />
              <Button
                buttonStyle={styles.postButtonStyle}
                titleStyle={{ color: 'white' }}
                title="Post"
                type="outline"
                onPress={function () {
                  setIsLoading(true);
                  firebase
                    .firestore()
                    .collection('posts')
                    .add({
                      userID: auth.currentUser.uid,
                      author: auth.currentUser.displayName,
                      body: newPostText,
                      created_at: firebase.firestore.Timestamp.now(),
                      likes: [],
                      comments: [],
                    })
                    .then(() => {
                      setIsLoading(false);
                      alert('Post created successfully!');
                    })
                    .catch((error) => {
                      setIsLoading(false);
                      alert(error);
                    })
                }}
              />
            </Card>
            <FlatList
              data={postList}
              renderItem={postItem => (
                <PostCard
                  name={postItem.item.data.author}
                  date={postItem.item.data.created_at.toDate().toString()}
                  post={postItem.item.data.body}
                  email={postItem.item.data.userID}
                />
              )}
            />

          </View>
        )}
      </AuthContext.Consumer>
    )
  }
}


const styles = StyleSheet.create({
  rootViewStyle: {
    flex: 1,
    backgroundColor: '#17223B',
  },
  writePostCardStyle: {
    backgroundColor: '#17223B',
    borderColor: '#17223B',
  },
  postButtonStyle: {
    borderColor: 'white',
    borderWidth: 1,
    width: '94%',
    alignSelf: 'center',
  },

  inputStyle: {
    borderBottomColor: 'white',
  },
});

export default HomeScreen;
