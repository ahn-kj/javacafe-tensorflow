#-*- coding: utf-8 -*-

import tensorflow as tf

# ======== 학습데이터 ========
# 학습시간
x_data = [54, 8, 30, 24, 46, 12, 20, 37, 40, 48]
# 토익점수
y_data = [800, 320, 600, 630, 700, 680, 730, 720, 700, 920]

# ======== 초기값 설정 =========
W = tf.Variable(tf.random_uniform([1], -1.0, 1.0))
b = tf.Variable(tf.random_uniform([1], -1.0, 1.0))

# ======== 변수 설정 ========
X = tf.placeholder(tf.float32)
Y = tf.placeholder(tf.float32)

# ======== Linear Regression 에서 학습될 가설 ========
hypothesis = W * X + b

# ======== Linear Regression 에서 학습될 가설의 Cost Function ========
cost = tf.reduce_mean(tf.square(hypothesis - Y))

# ======== Gradient Descent Algorithm 에서 Step ========
learning_rate = 0.0008

# ======== 텐서플로우에 내장된 GradientDescentOptimizer ========
optimizer = tf.train.GradientDescentOptimizer(learning_rate).minimize(cost)

init = tf.initialize_all_variables()

sess = tf.Session()
sess.run(init)

# ======== 학습 시작 ========
for step in xrange(20000):
    sess.run(optimizer, feed_dict={X: x_data, Y: y_data})

    if step % 20 == 0:
        print step, sess.run(cost, feed_dict={X: x_data, Y: y_data}), sess.run(W), sess.run(b)

# ======== 학습된 우리의 프로그램에 예측 문의 ========
print "10시간:" + str(sess.run(hypothesis, feed_dict={X: 10}))
print "40시간:" + str(sess.run(hypothesis, feed_dict={X: 40}))
