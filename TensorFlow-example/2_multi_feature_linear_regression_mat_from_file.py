# -*- coding: utf-8 -*-

import tensorflow as tf
import numpy as np

# ======== 학습데이터를 파일에서 읽어옴 ========
xy = np.loadtxt('train.csv', unpack=True, dtype='float32')

x_data = xy[0:-1]
y_data = xy[-1]

# ======== 초기값 설정 =========
W = tf.Variable(tf.random_uniform([1, 3], -1.0, 1.0))

# ======== 변수 설정 ========
X = tf.placeholder(tf.float32)
Y = tf.placeholder(tf.float32)

# ======== Multiple Linear Regression 에서 학습될 가설 ========
hypothesis = tf.matmul(W, X)

# ======== Multiple Linear Regression 에서 학습될 가설의 Cost Function ========
cost = tf.reduce_mean(tf.square(hypothesis - Y))

# ======== Gradient Descent Algorithm 에서 Step ========
learning_rate = 0.0006

# ======== 텐서플로우에 내장된 GradientDescentOptimizer ========
optimizer = tf.train.GradientDescentOptimizer(learning_rate).minimize(cost)

init = tf.initialize_all_variables()

sess = tf.Session()
sess.run(init)

# ======== 학습 시작 ========
for step in xrange(40000):
    sess.run(optimizer, feed_dict={X: x_data, Y: y_data})
    if step % 100 == 0:
        print step, sess.run(cost, feed_dict={X: x_data, Y: y_data}), sess.run(W)

# ======== 학습된 우리의 프로그램에 예측 문의 ========

# 30 시간 공부하고 10개월 해외에서 거주했을 경우 토익점수 예측
print "30시간, 10개월 >> " + str(sess.run(hypothesis, feed_dict={X: [[1], [30], [10]]})) + " 점"

# 2 시간 공부하고 24개월 해외에서 거주했을 경우 토익점수 예측
print "2시간, 24개월 >> " + str(sess.run(hypothesis, feed_dict={X: [[1], [2], [24]]})) + " 점"
